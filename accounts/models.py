from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    CARGO_CHOICES = [
        ('admin', 'Administrador'),
        ('engenheiro', 'Engenheiro'),
        ('financeiro', 'Financeiro'),
    ]
    cargo = models.CharField(max_length=20, choices=CARGO_CHOICES, default='engenheiro')
    telefone = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.get_cargo_display()})'

    @property
    def is_admin(self):
        return self.cargo == 'admin' or self.is_superuser

    @property
    def is_engenheiro(self):
        return self.cargo == 'engenheiro'

    @property
    def is_financeiro(self):
        return self.cargo == 'financeiro'

    @property
    def pode_editar(self):
        return self.cargo in ('admin', 'engenheiro') or self.is_superuser
