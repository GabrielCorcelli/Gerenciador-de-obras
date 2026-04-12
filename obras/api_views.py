import io

from django.db.models import Q, Sum, F
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from .models import Obra
from .serializers import ObraSerializer
from materiais.serializers import CompraMaterialSerializer, BoletosSerializer


class ObraViewSet(viewsets.ModelViewSet):
    serializer_class = ObraSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Obra.objects.all()
        q = self.request.query_params.get('q', '').strip()
        status_f = self.request.query_params.get('status', '')
        tipo = self.request.query_params.get('tipo', '')
        if q:
            qs = qs.filter(Q(nome__icontains=q) | Q(cliente__icontains=q))
        if status_f:
            qs = qs.filter(status=status_f)
        if tipo:
            qs = qs.filter(tipo_obra=tipo)
        return qs

    def destroy(self, request, *args, **kwargs):
        if not request.user.pode_editar:
            return Response({'error': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get', 'post'])
    def compras(self, request, pk=None):
        obra = self.get_object()
        if request.method == 'GET':
            compras = obra.compras.select_related('categoria', 'registrado_por').all()
            return Response(CompraMaterialSerializer(compras, many=True).data)
        if not request.user.pode_editar:
            return Response({'error': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
        data = {**request.data, 'obra': obra.pk}
        serializer = CompraMaterialSerializer(data=data)
        if serializer.is_valid():
            serializer.save(registrado_por=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def boletos(self, request, pk=None):
        obra = self.get_object()
        if request.method == 'GET':
            boletos = obra.boletos.select_related('registrado_por').all()
            return Response(BoletosSerializer(boletos, many=True).data)
        if not request.user.pode_editar:
            return Response({'error': 'Sem permissão.'}, status=status.HTTP_403_FORBIDDEN)
        data = {**request.data, 'obra': obra.pk}
        serializer = BoletosSerializer(data=data)
        if serializer.is_valid():
            serializer.save(registrado_por=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        obra = self.get_object()
        compras = obra.compras.select_related('categoria').order_by('data_compra')
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm, leftMargin=15*mm, rightMargin=15*mm)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('T', parent=styles['Title'], fontSize=16, spaceAfter=4*mm)
        elements = []
        elements.append(Paragraph(f'Relatório da Obra: {obra.nome}', title_style))
        from django.utils.timezone import now as tz_now
        elements.append(Paragraph(f'Gerado em: {tz_now().strftime("%d/%m/%Y %H:%M")}', styles['Normal']))
        elements.append(Spacer(1, 6*mm))
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
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 6*mm))
        elements.append(Paragraph('Materiais Comprados', styles['Heading2']))
        elements.append(Spacer(1, 2*mm))
        if compras.exists():
            mat_data = [['Data', 'Categoria', 'Descrição', 'Qtd', 'Un', 'Preço Un.', 'Total']]
            for c in compras:
                mat_data.append([
                    c.data_compra.strftime('%d/%m/%Y'), c.categoria.nome, c.descricao[:40],
                    f'{c.quantidade:,.2f}', c.get_unidade_display(),
                    f'R$ {c.preco_unitario:,.2f}', f'R$ {c.preco_total:,.2f}',
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
            ]))
            elements.append(mat_table)
        else:
            elements.append(Paragraph('Nenhuma compra registrada.', styles['Normal']))
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="relatorio_obra_{obra.pk}.pdf"'
        return response
