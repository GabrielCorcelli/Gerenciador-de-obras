from django.contrib import admin
from .models import Obra


@admin.register(Obra)
class ObraAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cliente', 'tipo_obra', 'status', 'cidade', 'estado', 'data_inicio', 'data_previsao_fim', 'orcamento_previsto')
    list_filter = ('status', 'tipo_obra', 'estado')
    search_fields = ('nome', 'cliente', 'endereco', 'cidade')
    date_hierarchy = 'data_inicio'
