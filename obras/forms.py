from django import forms
from .models import Obra


class ObraForm(forms.ModelForm):
    class Meta:
        model = Obra
        fields = [
            'nome', 'descricao', 'cliente', 'endereco', 'cidade', 'estado',
            'cep', 'tipo_obra', 'status', 'data_inicio', 'data_previsao_fim',
            'data_fim_real', 'orcamento_previsto', 'observacoes', 'responsavel',
        ]
        widgets = {
            'data_inicio': forms.DateInput(attrs={'type': 'date'}),
            'data_previsao_fim': forms.DateInput(attrs={'type': 'date'}),
            'data_fim_real': forms.DateInput(attrs={'type': 'date'}),
            'descricao': forms.Textarea(attrs={'rows': 3}),
            'observacoes': forms.Textarea(attrs={'rows': 3}),
        }
