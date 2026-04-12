from django import forms
from .models import CompraMaterial


class CompraMaterialForm(forms.ModelForm):
    class Meta:
        model = CompraMaterial
        fields = [
            'categoria', 'descricao', 'quantidade', 'unidade',
            'preco_unitario', 'fornecedor', 'nota_fiscal',
            'data_compra', 'observacoes',
        ]
        widgets = {
            'data_compra': forms.DateInput(attrs={'type': 'date'}),
            'observacoes': forms.Textarea(attrs={'rows': 2}),
        }
