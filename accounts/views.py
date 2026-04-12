from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect, render
from django.views.generic import ListView, CreateView, UpdateView

from .forms import CustomUserCreationForm, CustomUserChangeForm, LoginForm
from .models import CustomUser


def login_view(request):
    if request.user.is_authenticated:
        return redirect('core:dashboard')
    form = LoginForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = authenticate(
            request,
            username=form.cleaned_data['username'],
            password=form.cleaned_data['password'],
        )
        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', 'core:dashboard')
            return redirect(next_url)
        messages.error(request, 'Usuário ou senha inválidos.')
    return render(request, 'accounts/login.html', {'form': form})


@login_required
def logout_view(request):
    logout(request)
    return redirect('accounts:login')


class UsuarioListView(LoginRequiredMixin, ListView):
    model = CustomUser
    template_name = 'accounts/usuario_list.html'
    context_object_name = 'usuarios'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_admin:
            messages.error(request, 'Acesso restrito a administradores.')
            return redirect('core:dashboard')
        return super().dispatch(request, *args, **kwargs)


class UsuarioCreateView(LoginRequiredMixin, CreateView):
    model = CustomUser
    form_class = CustomUserCreationForm
    template_name = 'accounts/usuario_form.html'
    success_url = '/accounts/usuarios/'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_admin:
            messages.error(request, 'Acesso restrito a administradores.')
            return redirect('core:dashboard')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        messages.success(self.request, 'Usuário criado com sucesso!')
        return super().form_valid(form)


class UsuarioUpdateView(LoginRequiredMixin, UpdateView):
    model = CustomUser
    form_class = CustomUserChangeForm
    template_name = 'accounts/usuario_form.html'
    success_url = '/accounts/usuarios/'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_admin:
            messages.error(request, 'Acesso restrito a administradores.')
            return redirect('core:dashboard')
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        messages.success(self.request, 'Usuário atualizado com sucesso!')
        return super().form_valid(form)
