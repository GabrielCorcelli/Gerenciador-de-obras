from django.urls import path
from . import views

app_name = 'obras'

urlpatterns = [
    path('', views.ObraListView.as_view(), name='obra_list'),
    path('nova/', views.ObraCreateView.as_view(), name='obra_create'),
    path('<int:pk>/', views.ObraDetailView.as_view(), name='obra_detail'),
    path('<int:pk>/editar/', views.ObraUpdateView.as_view(), name='obra_update'),
    path('<int:pk>/excluir/', views.ObraDeleteView.as_view(), name='obra_delete'),
    path('<int:pk>/relatorio-pdf/', views.relatorio_obra_pdf, name='obra_relatorio_pdf'),
]
