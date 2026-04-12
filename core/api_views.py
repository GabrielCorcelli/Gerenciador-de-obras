from datetime import timedelta

from django.db.models import Sum, F
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from obras.models import Obra
from materiais.models import CompraMaterial


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    hoje = timezone.now().date()
    prazo_alerta = hoje + timedelta(days=30)

    total_obras = Obra.objects.count()
    obras_ativas = Obra.objects.filter(status='em_andamento').count()
    obras_atrasadas = Obra.objects.filter(status='em_andamento', data_previsao_fim__lt=hoje).count()

    gasto_total = CompraMaterial.objects.aggregate(
        total=Sum(F('quantidade') * F('preco_unitario'))
    )['total'] or 0

    obras_prazo = list(
        Obra.objects.filter(
            status='em_andamento',
            data_previsao_fim__lte=prazo_alerta,
            data_previsao_fim__gte=hoje,
        ).values('id', 'nome', 'data_previsao_fim')[:5]
    )
    for o in obras_prazo:
        o['data_previsao_fim'] = o['data_previsao_fim'].strftime('%d/%m/%Y')

    gastos_por_obra = list(
        Obra.objects.annotate(
            gasto=Sum(F('compras__quantidade') * F('compras__preco_unitario'))
        ).filter(gasto__isnull=False).order_by('-gasto')[:10].values('id', 'nome', 'gasto')
    )
    for g in gastos_por_obra:
        g['gasto'] = float(g['gasto'])

    gastos_por_categoria = list(
        CompraMaterial.objects.values('categoria__nome')
        .annotate(total=Sum(F('quantidade') * F('preco_unitario')))
        .order_by('-total')
    )
    for g in gastos_por_categoria:
        g['total'] = float(g['total'])

    obras_recentes_full = []
    for o_dict in Obra.objects.order_by('-criado_em')[:6]:
        obras_recentes_full.append({
            'id': o_dict.pk,
            'nome': o_dict.nome,
            'cliente': o_dict.cliente,
            'status': o_dict.status,
            'gasto_total': float(o_dict.gasto_total),
            'orcamento_previsto': float(o_dict.orcamento_previsto),
        })

    return Response({
        'total_obras': total_obras,
        'obras_ativas': obras_ativas,
        'gasto_total': float(gasto_total),
        'obras_atrasadas': obras_atrasadas,
        'obras_prazo': obras_prazo,
        'gastos_por_obra': gastos_por_obra,
        'gastos_por_categoria': gastos_por_categoria,
        'obras_recentes': obras_recentes_full,
    })
