<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { KorisniciService } from '@/service/KorisniciService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const korisnici = ref(null);
const korisnikDialog = ref(false);
const deleteKorisnikDialog = ref(false);
const deleteKorisniciDialog = ref(false);
const korisnik = ref({});
const selectedKorisnici = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
// const statuses = ref([
//     { label: 'INSTOCK', value: 'instock' },
//     { label: 'LOWSTOCK', value: 'lowstock' },
//     { label: 'OUTOFSTOCK', value: 'outofstock' }
// ]);
const roles = ref([
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" }
]);

const korisniciService = new KorisniciService();

// const getBadgeSeverity = (inventoryStatus) => {
//     switch (inventoryStatus.toLowerCase()) {
//         case 'instock':
//             return 'success';
//         case 'lowstock':
//             return 'warning';
//         case 'outofstock':
//             return 'danger';
//         default:
//             return 'info';
//     }
// };

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    korisniciService.getKorisnici().then((data) => (korisnici.value = data));
});

// const formatCurrency = (value) => {
//     return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
// };

const openNew = () => {
    korisnik.value = {};
    submitted.value = false;
    korisnikDialog.value = true;
};

const hideDialog = () => {
    korisnikDialog.value = false;
    submitted.value = false;
};

const saveKorisnik = () => {
    submitted.value = true;
    if (korisnik.value.name && korisnik.value.name.trim() && 
        korisnik.value.lastName && korisnik.value.lastName.trim() &&
        korisnik.value.username && korisnik.value.username.trim() &&
        korisnik.value.email && isValidEmail(korisnik.value.email) && korisnik.value.email.trim() &&
        korisnik.value.password && korisnik.value.password.trim() &&
        korisnik.value.role) {
        if (korisnik.value.id) {
            korisnici.value[findIndexById(korisnik.value.id)] = korisnik.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Korisnik ažuriran', life: 3000 });
        } else {
            korisnik.value.id = createId();
            korisnik.role = korisnik.value.role.value;
            korisnici.value.push(korisnik.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Korisnik kreiran', life: 3000 });
        }
        korisnikDialog.value = false;
        korisnik.value = {};
    }
};

const editKorisnik = (editKorisnik) => {
    korisnik.value = { ...editKorisnik };
    korisnikDialog.value = true;
};

const confirmDeleteKorisnik = (editKorisnik) => {
    korisnik.value = editKorisnik;
    deleteKorisnikDialog.value = true;
};

const deleteKorisnik = () => {
    korisnici.value = korisnici.value.filter((val) => val.id !== korisnik.value.id);
    deleteKorisnikDialog.value = false;
    korisnik.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Korisnik obrisan', life: 3000 });
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < korisnici.value.length; i++) {
        if (korisnici.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    const maxId = Math.max(...korisnici._rawValue
        .filter(user => user.id !== null)
        .map(user => user.id));

    return maxId + 1;
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteKorisniciDialog.value = true;
};
const deleteSelectedKorisnici = () => {
    korisnici.value = korisnici.value.filter((val) => !selectedKorisnici.value.includes(val));
    deleteKorisniciDialog.value = false;
    selectedKorisnici.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Korisnici obrisani', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <!-- <h1>Korisnici</h1> -->
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Dodaj" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            <Button label="Briši" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedKorisnici || !selectedKorisnici.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Uvoz" class="mr-2 inline-block" />
                        <Button label="Izvoz" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="korisnici"
                    v-model:selection="selectedKorisnici"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} korisnici">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Pregled korisnika</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Pretraži..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="id" header="Id" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Id</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>
                    <Column field="name" header="Ime" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Ime</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column field="lastName" header="Prezime" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Prezime</span>
                            {{ slotProps.data.lastName }}
                        </template>
                    </Column>
                    <Column field="username" header="Korisničko ime" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Korisničko ime</span>
                            {{ slotProps.data.username }}
                        </template>
                    </Column>
                    <Column field="email" header="Email" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Email</span>
                            {{ slotProps.data.email }}
                        </template>
                    </Column>
                    <Column field="role" header="Uloga" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Uloga</span>
                            {{ slotProps.data.role.value ? slotProps.data.role.value : slotProps.data.role }}
                        </template>
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editKorisnik(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteKorisnik(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="korisnikDialog" :style="{ width: '450px' }" :header="korisnik.id ? 'Detalji o korisniku' : 'Novi korisnik'" :modal="true" class="p-fluid">
                    <!-- <img :src="'/demo/images/product/' + product.image" :alt="product.image" v-if="product.image" width="150" class="mt-0 mx-auto mb-5 block shadow-2" /> -->
                    <div class="field">
                        <label for="name">Ime</label>
                        <InputText id="name" v-model.trim="korisnik.name" required="true" autofocus :invalid="submitted && !korisnik.name" />
                        <small class="p-invalid" v-if="submitted && !korisnik.name">Unesite ime.</small>
                    </div>

                    <div class="field">
                        <label for="lastName">Prezime</label>
                        <InputText id="lastName" v-model.trim="korisnik.lastName" required="true" autofocus :invalid="submitted && !korisnik.lastName" />
                        <small class="p-invalid" v-if="submitted && !korisnik.lastName">Unesite prezime.</small>
                    </div>

                    <div class="field">
                        <label for="username">Korisničko ime</label>
                        <InputText id="username" v-model.trim="korisnik.username" required="true" autofocus :invalid="submitted && !korisnik.username" />
                        <small class="p-invalid" v-if="submitted && !korisnik.username">Unesite korisničko ime.</small>
                    </div>

                    <div class="field">
                        <label for="email">Email</label>
                        <InputText id="email" v-model.trim="korisnik.email" required="true" autofocus :invalid="submitted && (!korisnik.email || !isValidEmail(korisnik.email))" />
                        <small class="p-invalid" v-if="submitted && !korisnik.email">Unesite email adresu.</small>
                        <small class="p-invalid" v-if="submitted && !isValidEmail(korisnik.email)">Unesite valjanu email adresu.</small>
                    </div>

                    <div class="field">
                        <label for="password">Lozinka</label>
                        <InputText id="password" v-model.trim="korisnik.password" required="true" autofocus :invalid="submitted && !korisnik.password" />
                        <small class="p-invalid" v-if="submitted && !korisnik.password">Unesite lozinku.</small>
                    </div>

                    <div class="field">
                        <label for="role" class="mb-3">Uloga</label>
                        <Dropdown id="role" v-model="korisnik.role" :options="roles" optionLabel="label" placeholder="Select a Role" :invalid="submitted && !korisnik.role">
                            <template #value="slotProps">
                                <div v-if="slotProps.value && slotProps.value.value">
                                    <span>{{ slotProps.value.label }}</span>
                                </div>
                                <div v-else-if="slotProps.value && !slotProps.value.value">
                                    <span>{{ slotProps.value }}</span>
                                </div>
                                <span v-else>
                                    {{ slotProps.placeholder }}
                                </span>
                            </template>
                        </Dropdown>
                        <small class="p-invalid" v-if="submitted && !korisnik.role">Izaberite ulogu.</small>
                    </div>

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" text="" @click="saveKorisnik" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteKorisnikDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="korisnik"
                            >Jeste li sigurni da želite obrisati <b>{{ korisnik.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteKorisnikDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteKorisnik" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteKorisniciDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="korisnik">Jeste li sigurni da želite obrisati odabrane korisnike?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteKorisniciDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedKorisnici" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
