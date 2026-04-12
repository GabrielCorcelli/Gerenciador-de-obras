import io
from decimal import Decimal

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Sum, F, Q
from django.http import HttpResponse
from django.shortcuts import redirect
from django.urls import reverse_lazy, reverse
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from .models import Obra
from .forms import ObraForm


class EditPermissionMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.pode_editar:
            messages.error(request, 'Você não tem permissão para realizar esta ação.')
            return redirect('obras:obra_list')
        return super().dispatch(request, *args, **kwargs)


class ObraListView(LoginRequiredMixin, ListView):
    model = Obra
    template_name = 'obras/obra_list.html'
    context_object_name = 'obras'
    paginate_by = 12

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.GET.get('q', '').strip()
        status = self.request.GET.get('status', '')
        tipo = self.request.GET.get('tipo', '')
        if q:
            qs = qs.filter(Q(nome__icontains=q) | Q(cliente__icontains=q))
        if status:
            qs = qs.filter(status=status)
        if tipo:
            qs = qs.filter(tipo_obra=tipo)
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['status_choices'] = Obra.STATUS_CHOICES
        ctx['tipo_choices'] = Obra.TIPO_CHOICES
        ctx['q'] = self.request.GET.get('q', '')
        ctx['status_filter'] = self.request.GET.get('status', '')
        ctx['tipo_filter'] = self.request.GET.get('tipo', '')
        return ctx


class ObraDetailView(LoginRequiredMixin, DetailView):
    model = Obra
    template_name = 'obras/obra_detail.html'
    context_object_name = 'obra'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        obra = self.object
        compras = obra.compras.select_related('categoria', 'registrado_por').all()
        ctx['compras'] = compras
        ctx['gastos_por_categoria'] = (
            obra.compras.values('categoria__nome')
            .annotate(total=Sum(F('quantidade') * F('preco_unitario')))
            .order_by('-total')
        )
        ctx['boletos'] = obra.boletos.select_related('registrado_por').all()
        from django.db.models import Sum as DSum
        ctx['boletos_total'] = obra.boletos.aggregate(total=DSum('valor'))['total'] or 0
        return ctx


class ObraCreateView(LoginRequiredMixin, EditPermissionMixin, CreateView):
    model = Obra
    form_class = ObraForm
    template_name = 'obras/obra_form.html'

    def get_success_url(self):
        return reverse('obras:obra_detail', kwargs={'pk': self.object.pk})

    def form_valid(self, form):
        messages.success(self.request, 'Obra cadastrada com sucesso!')
        return super().form_valid(form)


class ObraUpdateView(LoginRequiredMixin, EditPermissionMixin, UpdateView):
    model = Obra
    form_class = ObraForm
    template_name = 'obras/obra_form.html'

    def get_success_url(self):
        return reverse('obras:obra_detail', kwargs={'pk': self.object.pk})

    def form_valid(self, form):
        messages.success(self.request, 'Obra atualizada com sucesso!')
        return super().form_valid(form)


class ObraDeleteView(LoginRequiredMixin, EditPermissionMixin, DeleteView):
    model = Obra
    template_name = 'obras/obra_confirm_delete.html'
    success_url = reverse_lazy('obras:obra_list')

    def form_valid(self, form):
        messages.success(self.request, 'Obra excluída com sucesso!')
        return super().form_valid(form)


@login_required
def relatorio_obra_pdf(request, pk):
    obra = Obra.objects.get(pk=pk)
    compras = obra.compras.select_related('categoria').order_by('data_compra')

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            topMargin=20*mm, bottomMargin=20*mm,
                            leftMargin=15*mm, rightMargin=15*mm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=18, spaceAfter=6*mm)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, spaceAfter=4*mm, textColor=colors.grey)
    elements = []

    # Header
    elements.append(Paragraph(f'Relatório da Obra: {obra.nome}', title_style))
    elements.append(Paragraph(f'Gerado em: {__import__("django.utils.timezone", fromlist=["now"]).now().strftime("%d/%m/%Y %H:%M")}', subtitle_style))
    elements.append(Spacer(1, 4*mm))

    # Obra info
    info_data = [
        ['Cliente:', obra.cliente, 'Status:', obra.get_status_display()],
        ['Tipo:', obra.get_tipo_obra_display(), 'Responsável:', str(obra.responsavel)],
        ['Endereço:', f'{obra.endereco}, {obra.cidade}/{obra.estado}', 'CEP:', obra.cep or '-'],
        ['Início:', obra.data_inicio.strftime('%d/%m/%Y'), 'Prev. Término:', obra.data_previsao_fim.strftime('%d/%m/%Y')],
        ['Orçamento:', f'R$ {obra.orcamento_previsto:,.2f}', 'Gasto Total:', f'R$ {obra.gasto_total:,.2f}'],
        ['Saldo:', f'R$ {obra.saldo:,.2f}', '% Gasto:', f'{obra.percentual_gasto}%'],
    ]
    info_table = Table(info_data, colWidths=[70, 140, 80, 140])
    info_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 6*mm))

    # Materials table
    elements.append(Paragraph('Materiais Comprados', styles['Heading2']))
    elements.append(Spacer(1, 2*mm))

    if compras.exists():
        mat_data = [['Data', 'Categoria', 'Descrição', 'Qtd', 'Un', 'Preço Un.', 'Total']]
        for c in compras:
            mat_data.append([
                c.data_compra.strftime('%d/%m/%Y'),
                c.categoria.nome,
                c.descricao[:40],
                f'{c.quantidade:,.2f}',
                c.get_unidade_display(),
                f'R$ {c.preco_unitario:,.2f}',
                f'R$ {c.preco_total:,.2f}',
            ])
        mat_data.append(['', '', '', '', '', 'TOTAL:', f'R$ {obra.gasto_total:,.2f}'])

        mat_table = Table(mat_data, colWidths=[55, 65, 110, 35, 30, 60, 65])
        mat_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#343a40')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -2), 0.5, colors.grey),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(mat_table)
    else:
        elements.append(Paragraph('Nenhuma compra de material registrada.', styles['Normal']))

    # Gastos por categoria
    gastos_cat = (
        obra.compras.values('categoria__nome')
        .annotate(total=Sum(F('quantidade') * F('preco_unitario')))
        .order_by('-total')
    )
    if gastos_cat:
        elements.append(Spacer(1, 6*mm))
        elements.append(Paragraph('Resumo por Categoria', styles['Heading2']))
        elements.append(Spacer(1, 2*mm))
        cat_data = [['Categoria', 'Total']]
        for g in gastos_cat:
            cat_data.append([g['categoria__nome'], f'R$ {g["total"]:,.2f}'])
        cat_table = Table(cat_data, colWidths=[200, 100])
        cat_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#343a40')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(cat_table)

    doc.build(elements)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="relatorio_obra_{obra.pk}.pdf"'
    return response
