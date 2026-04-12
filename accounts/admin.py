from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email', 'cargo', 'is_active')
    list_filter = ('cargo', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Dados Adicionais', {'fields': ('cargo', 'telefone')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Dados Adicionais', {'fields': ('cargo', 'telefone')}),
    )
