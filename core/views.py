import json
from datetime import timedelta

from django.contrib.auth.decorators import login_required
from django.db.models import Sum, F, Count, Q
from django.shortcuts import render
from django.utils import timezone

from obras.models import Obra
from materiais.models import CompraMaterial


@login_required
def dashboard(request):
    hoje = timezone.now().date()
    obras_ativas = Obra.objects.filter(status='em_andamento')
    total_obras = Obra.objects.count()
    obras_ativas_count = obras_ativas.count()

    # Gasto total geral
    gasto_total = CompraMaterial.objects.aggregate(
        total=Sum(F('quantidade') * F('preco_unitario'))
    )['total'] or 0

    # Obras próximas do prazo (30 dias)
    prazo_alerta = hoje + timedelta(days=30)
    obras_prazo = Obra.objects.filter(
        status='em_andamento',
        data_previsao_fim__lte=prazo_alerta,
        data_previsao_fim__gte=hoje,
    )

    # Obras atrasadas
    obras_atrasadas = Obra.objects.filter(
        status='em_andamento',
        data_previsao_fim__lt=hoje,
    )

    # Gastos por obra (top 10 para gráfico de barras)
    gastos_por_obra = (
        Obra.objects.annotate(
            gasto=Sum(F('compras__quantidade') * F('compras__preco_unitario'))
        )
        .filter(gasto__isnull=False)
        .order_by('-gasto')[:10]
    )
    chart_obras_labels = json.dumps([o.nome[:25] for o in gastos_por_obra])
    chart_obras_data = json.dumps([float(o.gasto) for o in gastos_por_obra])

    # Gastos por categoria (para gráfico de pizza)
    gastos_por_categoria = (
        CompraMaterial.objects.values('categoria__nome')
        .annotate(total=Sum(F('quantidade') * F('preco_unitario')))
        .order_by('-total')
    )
    chart_cat_labels = json.dumps([g['categoria__nome'] for g in gastos_por_categoria])
    chart_cat_data = json.dumps([float(g['total']) for g in gastos_por_categoria])

    # Obras recentes
    obras_recentes = Obra.objects.order_by('-criado_em')[:5]

    context = {
        'total_obras': total_obras,
        'obras_ativas_count': obras_ativas_count,
        'gasto_total': gasto_total,
        'obras_prazo': obras_prazo,
        'obras_atrasadas': obras_atrasadas,
        'obras_recentes': obras_recentes,
        'chart_obras_labels': chart_obras_labels,
        'chart_obras_data': chart_obras_data,
        'chart_cat_labels': chart_cat_labels,
        'chart_cat_data': chart_cat_data,
    }
    return render(request, 'core/dashboard.html', context)
