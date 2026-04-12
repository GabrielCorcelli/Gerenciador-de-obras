from django.contrib import admin
from .models import CategoriaMaterial, CompraMaterial, Boletos


@admin.register(CategoriaMaterial)
class CategoriaMaterialAdmin(admin.ModelAdmin):
    list_display = ('nome',)
    search_fields = ('nome',)


@admin.register(CompraMaterial)
class CompraMaterialAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'obra', 'categoria', 'quantidade', 'unidade', 'preco_unitario', 'data_compra', 'fornecedor')
    list_filter = ('categoria', 'obra', 'data_compra')
    search_fields = ('descricao', 'fornecedor', 'nota_fiscal')
    date_hierarchy = 'data_compra'
    raw_id_fields = ('obra',)

@admin.register(Boletos)
class BoletosAdmin(admin.ModelAdmin):
    list_display = ('obra', 'data_vencimento', 'valor')
    list_filter = ('data_vencimento',)
    search_fields = ('obra__nome',)
    date_hierarchy = 'data_vencimento'
    raw_id_fields = ('obra',)
