from django.conf import settings
from django.db import models


class CategoriaMaterial(models.Model):
    nome = models.CharField('Nome', max_length=100, unique=True)

    class Meta:
        verbose_name = 'Categoria de Material'
        verbose_name_plural = 'Categorias de Material'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class CompraMaterial(models.Model):
    UNIDADE_CHOICES = [
        ('un', 'Unidade'),
        ('kg', 'Quilograma'),
        ('m', 'Metro'),
        ('m2', 'Metro²'),
        ('m3', 'Metro³'),
        ('l', 'Litro'),
        ('saco', 'Saco'),
        ('pc', 'Peça'),
        ('cx', 'Caixa'),
        ('rl', 'Rolo'),
        ('vb', 'Verba'),
    ]

    obra = models.ForeignKey(
        'obras.Obra', on_delete=models.CASCADE,
        related_name='compras', verbose_name='Obra'
    )
    categoria = models.ForeignKey(
        CategoriaMaterial, on_delete=models.PROTECT,
        verbose_name='Categoria'
    )
    descricao = models.CharField('Descrição do Material', max_length=300)
    quantidade = models.DecimalField('Quantidade', max_digits=10, decimal_places=2)
    unidade = models.CharField('Unidade', max_length=10, choices=UNIDADE_CHOICES, default='un')
    preco_unitario = models.DecimalField('Preço Unitário', max_digits=10, decimal_places=2)
    fornecedor = models.CharField('Fornecedor', max_length=200, blank=True)
    nota_fiscal = models.CharField('Nota Fiscal', max_length=50, blank=True)
    data_compra = models.DateField('Data da Compra')
    observacoes = models.TextField('Observações', blank=True)
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        verbose_name='Registrado por'
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Compra de Material'
        verbose_name_plural = 'Compras de Material'
        ordering = ['-data_compra', '-criado_em']

    def __str__(self):
        return f'{self.descricao} - {self.obra.nome}'

    @property
    def preco_total(self):
        return self.quantidade * self.preco_unitario

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.quantidade is not None and self.quantidade <= 0:
            raise ValidationError({'quantidade': 'A quantidade deve ser positiva.'})
        if self.preco_unitario is not None and self.preco_unitario <= 0:
            raise ValidationError({'preco_unitario': 'O preço unitário deve ser positivo.'})
        
class Boletos(models.Model):
    obra = models.ForeignKey(
        'obras.Obra', on_delete=models.CASCADE,
        related_name='boletos', verbose_name='Obra'
    )
    descricao = models.CharField('Descrição do Boleto', max_length=300)
    valor = models.DecimalField('Valor', max_digits=10, decimal_places=2)
    data_vencimento = models.DateField('Data de Vencimento')
    data_pagamento = models.DateField('Data de Pagamento', null=True, blank=True)
    observacoes = models.TextField('Observações', blank=True)
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        verbose_name='Registrado por'
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Boleto'
        verbose_name_plural = 'Boletos'
        ordering = ['-data_vencimento', '-criado_em']

    def __str__(self):
        return f'{self.descricao} - {self.obra.nome}'
