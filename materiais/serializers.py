from rest_framework import serializers
from .models import CompraMaterial, CategoriaMaterial, Boletos


class CategoriaMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaMaterial
        fields = '__all__'


class CompraMaterialSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    unidade_display = serializers.CharField(source='get_unidade_display', read_only=True)
    preco_total = serializers.SerializerMethodField()
    registrado_por_nome = serializers.SerializerMethodField()

    def get_preco_total(self, obj):
        return float(obj.preco_total)

    def get_registrado_por_nome(self, obj):
        return str(obj.registrado_por)

    class Meta:
        model = CompraMaterial
        fields = '__all__'
        read_only_fields = ['registrado_por', 'criado_em']


class BoletosSerializer(serializers.ModelSerializer):
    registrado_por_nome = serializers.SerializerMethodField()
    status_pagamento = serializers.SerializerMethodField()

    def get_registrado_por_nome(self, obj):
        return str(obj.registrado_por)

    def get_status_pagamento(self, obj):
        return 'pago' if obj.data_pagamento else 'pendente'

    class Meta:
        model = Boletos
        fields = '__all__'
        read_only_fields = ['registrado_por', 'criado_em']
