from django.conf import settings
from django.db import models
from django.db.models import Sum, F


class Obra(models.Model):
    TIPO_CHOICES = [
        ('construcao', 'Construção'),
        ('reforma', 'Reforma'),
        ('ampliacao', 'Ampliação'),
        ('manutencao', 'Manutenção'),
        ('demolicao', 'Demolição'),
    ]
    STATUS_CHOICES = [
        ('planejada', 'Planejada'),
        ('em_andamento', 'Em Andamento'),
        ('concluida', 'Concluída'),
        ('pausada', 'Pausada'),
        ('cancelada', 'Cancelada'),
    ]
    UF_CHOICES = [
        ('AC', 'AC'), ('AL', 'AL'), ('AP', 'AP'), ('AM', 'AM'), ('BA', 'BA'),
        ('CE', 'CE'), ('DF', 'DF'), ('ES', 'ES'), ('GO', 'GO'), ('MA', 'MA'),
        ('MT', 'MT'), ('MS', 'MS'), ('MG', 'MG'), ('PA', 'PA'), ('PB', 'PB'),
        ('PR', 'PR'), ('PE', 'PE'), ('PI', 'PI'), ('RJ', 'RJ'), ('RN', 'RN'),
        ('RS', 'RS'), ('RO', 'RO'), ('RR', 'RR'), ('SC', 'SC'), ('SP', 'SP'),
        ('SE', 'SE'), ('TO', 'TO'),
    ]

    nome = models.CharField('Nome da Obra', max_length=200)
    descricao = models.TextField('Descrição', blank=True)
    cliente = models.CharField('Cliente', max_length=200)
    endereco = models.CharField('Endereço', max_length=300)
    cidade = models.CharField('Cidade', max_length=100)
    estado = models.CharField('UF', max_length=2, choices=UF_CHOICES)
    cep = models.CharField('CEP', max_length=9, blank=True)
    tipo_obra = models.CharField('Tipo de Obra', max_length=20, choices=TIPO_CHOICES)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='planejada')
    data_inicio = models.DateField('Data de Início')
    data_previsao_fim = models.DateField('Previsão de Término')
    data_fim_real = models.DateField('Data de Conclusão', null=True, blank=True)
    orcamento_previsto = models.DecimalField('Orçamento Previsto', max_digits=12, decimal_places=2)
    observacoes = models.TextField('Observações', blank=True)
    responsavel = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='obras', verbose_name='Responsável'
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Obra'
        verbose_name_plural = 'Obras'
        ordering = ['-criado_em']

    def __str__(self):
        return f'{self.nome} ({self.get_status_display()})'

    @property
    def gasto_total(self):
        total = self.compras.aggregate(
            total=Sum(F('quantidade') * F('preco_unitario'))
        )['total']
        return total or 0

    @property
    def saldo(self):
        return self.orcamento_previsto - self.gasto_total

    @property
    def percentual_gasto(self):
        if self.orcamento_previsto > 0:
            return round(float(self.gasto_total) / float(self.orcamento_previsto) * 100, 1)
        return 0

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.data_previsao_fim and self.data_inicio and self.data_previsao_fim < self.data_inicio:
            raise ValidationError({
                'data_previsao_fim': 'A previsão de término deve ser posterior à data de início.'
            })
