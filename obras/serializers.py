from rest_framework import serializers
from .models import Obra


class ObraSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tipo_obra_display = serializers.CharField(source='get_tipo_obra_display', read_only=True)
    gasto_total = serializers.SerializerMethodField()
    saldo = serializers.SerializerMethodField()
    percentual_gasto = serializers.SerializerMethodField()
    responsavel_nome = serializers.SerializerMethodField()

    def get_gasto_total(self, obj):
        return float(obj.gasto_total)

    def get_saldo(self, obj):
        return float(obj.saldo)

    def get_percentual_gasto(self, obj):
        return obj.percentual_gasto

    def get_responsavel_nome(self, obj):
        return str(obj.responsavel)

    class Meta:
        model = Obra
        fields = '__all__'
