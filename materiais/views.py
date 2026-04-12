from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q, Sum, F
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.views.generic import ListView, CreateView, UpdateView, DeleteView

from obras.models import Obra
from .models import CompraMaterial, CategoriaMaterial
from .forms import CompraMaterialForm


class EditPermissionMixin:
    def dispatch(self, request, *args, **kwargs):
        if not request.user.pode_editar:
            messages.error(request, 'Você não tem permissão para realizar esta ação.')
            return redirect('obras:obra_list')
        return super().dispatch(request, *args, **kwargs)


class CompraListView(LoginRequiredMixin, ListView):
    model = CompraMaterial
    template_name = 'materiais/compra_list.html'
    context_object_name = 'compras'
    paginate_by = 20

    def get_queryset(self):
        qs = super().get_queryset().select_related('obra', 'categoria', 'registrado_por')
        q = self.request.GET.get('q', '').strip()
        obra_id = self.request.GET.get('obra', '')
        categoria_id = self.request.GET.get('categoria', '')
        if q:
            qs = qs.filter(Q(descricao__icontains=q) | Q(fornecedor__icontains=q))
        if obra_id:
            qs = qs.filter(obra_id=obra_id)
        if categoria_id:
            qs = qs.filter(categoria_id=categoria_id)
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['obras'] = Obra.objects.all()
        ctx['categorias'] = CategoriaMaterial.objects.all()
        ctx['q'] = self.request.GET.get('q', '')
        ctx['obra_filter'] = self.request.GET.get('obra', '')
        ctx['categoria_filter'] = self.request.GET.get('categoria', '')
        return ctx


class CompraCreateView(LoginRequiredMixin, EditPermissionMixin, CreateView):
    model = CompraMaterial
    form_class = CompraMaterialForm
    template_name = 'materiais/compra_form.html'

    def dispatch(self, request, *args, **kwargs):
        self.obra = get_object_or_404(Obra, pk=self.kwargs['obra_pk'])
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['obra'] = self.obra
        return ctx

    def form_valid(self, form):
        form.instance.obra = self.obra
        form.instance.registrado_por = self.request.user
        messages.success(self.request, 'Compra registrada com sucesso!')
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('obras:obra_detail', kwargs={'pk': self.obra.pk})


class CompraUpdateView(LoginRequiredMixin, EditPermissionMixin, UpdateView):
    model = CompraMaterial
    form_class = CompraMaterialForm
    template_name = 'materiais/compra_form.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['obra'] = self.object.obra
        return ctx

    def form_valid(self, form):
        messages.success(self.request, 'Compra atualizada com sucesso!')
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('obras:obra_detail', kwargs={'pk': self.object.obra.pk})


class CompraDeleteView(LoginRequiredMixin, EditPermissionMixin, DeleteView):
    model = CompraMaterial
    template_name = 'materiais/compra_confirm_delete.html'

    def get_success_url(self):
        return reverse('obras:obra_detail', kwargs={'pk': self.object.obra.pk})

    def form_valid(self, form):
        messages.success(self.request, 'Compra excluída com sucesso!')
        return super().form_valid(form)
