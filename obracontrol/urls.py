"""
URL configuration for obracontrol project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from obras.api_views import ObraViewSet
from materiais.api_views import CategoriaMaterialViewSet, CompraMaterialViewSet, BoletosViewSet
from accounts.api_views import UsuarioViewSet, login_view, logout_view
from core.api_views import dashboard_view

router = DefaultRouter()
router.register('obras', ObraViewSet, basename='obra')
router.register('categorias', CategoriaMaterialViewSet, basename='categoria')
router.register('compras', CompraMaterialViewSet, basename='compra')
router.register('boletos', BoletosViewSet, basename='boleto')
router.register('usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', login_view, name='api-login'),
    path('api/auth/logout/', logout_view, name='api-logout'),
    path('api/dashboard/', dashboard_view, name='api-dashboard'),
]
