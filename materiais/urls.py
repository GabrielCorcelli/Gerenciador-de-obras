from django.urls import path
from . import views

app_name = 'materiais'

urlpatterns = [
    path('', views.CompraListView.as_view(), name='compra_list'),
    path('obra/<int:obra_pk>/nova/', views.CompraCreateView.as_view(), name='compra_create'),
    path('<int:pk>/editar/', views.CompraUpdateView.as_view(), name='compra_update'),
    path('<int:pk>/excluir/', views.CompraDeleteView.as_view(), name='compra_delete'),
]
