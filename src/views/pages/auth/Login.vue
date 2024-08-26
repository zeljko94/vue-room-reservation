<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { AuthService } from '@/service/AuthService';
import router from '@/router';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const authService = new AuthService();
const { layoutConfig } = useLayout();
const email = ref('admin1');
const password = ref('asdd12331.1');
const checked = ref(false);

const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});


const onLogin = async () => {
    try {
        const token = await authService.login(email.value, password.value);
        if (token) {
            router.push('/dashboard');
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Došlo je do pogreške', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Login Error', detail: 'Došlo je do pogreške prilikom prijave', life: 3000 });
    }
};

</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Dobrodošli!</div>
                        <span class="text-600 font-medium">Prijavite se za nastavak</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">Korisničko ime</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Lozinka</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Zapamti me</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Zaboravljena lozinka?</a>
                        </div>
                        <Button label="Prijava" class="w-full p-3 text-xl" @click="onLogin()"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
    <Toast />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
