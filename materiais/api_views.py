from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import CompraMaterial, CategoriaMaterial, Boletos
from .serializers import CompraMaterialSerializer, CategoriaMaterialSerializer, BoletosSerializer


class CategoriaMaterialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CategoriaMaterial.objects.all()
    serializer_class = CategoriaMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]


class CompraMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = CompraMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CompraMaterial.objects.select_related('obra', 'categoria', 'registrado_por').all()
        q = self.request.query_params.get('q', '').strip()
        obra_id = self.request.query_params.get('obra', '')
        categoria_id = self.request.query_params.get('categoria', '')
        if q:
            qs = qs.filter(Q(descricao__icontains=q) | Q(fornecedor__icontains=q))
        if obra_id:
            qs = qs.filter(obra_id=obra_id)
        if categoria_id:
            qs = qs.filter(categoria_id=categoria_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(registrado_por=self.request.user)


class BoletosViewSet(viewsets.ModelViewSet):
    serializer_class = BoletosSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Boletos.objects.select_related('obra', 'registrado_por').all()
        obra_id = self.request.query_params.get('obra', '')
        if obra_id:
            qs = qs.filter(obra_id=obra_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(registrado_por=self.request.user)
