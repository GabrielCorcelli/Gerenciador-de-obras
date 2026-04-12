from rest_framework import serializers
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    cargo_display = serializers.CharField(source='get_cargo_display', read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'cargo', 'cargo_display', 'telefone', 'is_active',
            'pode_editar', 'is_admin',
        ]
        read_only_fields = ['is_active']
