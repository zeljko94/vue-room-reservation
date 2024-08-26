<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { SobeService } from '@/service/SobeService';
import { useToast } from 'primevue/usetoast';
import Soba from '@/models/Soba';

const toast = useToast();

const sobe = ref(null);
const sobaDialog = ref(false);
const deleteSobaDialog = ref(false);
const deleteSobeDialog = ref(false);
const soba = ref(null);
const selectedSobe = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);

const sobeService = new SobeService();

const getBadgeSeverity = (inventoryStatus) => {
    switch (inventoryStatus.toLowerCase()) {
        case 'instock':
            return 'success';
        case 'lowstock':
            return 'warning';
        case 'outofstock':
            return 'danger';
        default:
            return 'info';
    }
};

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    sobeService.getSobe().then((data) => (sobe.value = data));
});
const formatCurrency = (value) => {
    return value.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' });
};


const onImageSelected = async (event) => {
    const file = event.files[0];
    
    if (file) {
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                soba.value.thumbnailImg = reader.result; 
                // toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to read image', life: 5000 });
        }
    } else {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'No image selected', life: 3000 });
    }
};

const openNew = () => {
    soba.value = {};
    submitted.value = false;
    sobaDialog.value = true;
};

const hideDialog = () => {
    sobaDialog.value = false;
    submitted.value = false;
};

const saveSoba = async () => {
    submitted.value = true;

    if (soba.value.naziv && soba.value.naziv.trim() && soba.value.brojKreveta) {
        soba.value.opis = soba.value.opis ? soba.value.opis.trim() : '';

        try {
            if (soba.value.id) {
                // Update existing room
                await sobeService.updateSoba(soba.value.id, soba.value);
                sobe.value[findIndexById(soba.value.id)] = soba.value;
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Soba ažurirana', life: 3000 });
            } else {
                // Create new room
                soba.value.id = createId();
                await sobeService.createSoba(soba.value);
                sobe.value.push(soba.value);
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Soba kreirana', life: 3000 });
            }
        } catch (error) {
            // Handle errors from the backend
            console.error("Error saving soba:", error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Došlo je do greške prilikom spremanja sobe', life: 5000 });
        }

        sobaDialog.value = false;
        soba.value = {};
    }
};


const editSoba = (editSoba) => {
    soba.value = { ...editSoba };
    sobaDialog.value = true;
};

const confirmDeleteSoba = (editSoba) => {
    soba.value = editSoba;
    deleteSobaDialog.value = true;
};

const deleteSoba = async () => {
    try {
        await sobeService.deleteSoba(soba.value.id);
        sobe.value = sobe.value.filter((val) => val.id !== soba.value.id);
        deleteSobaDialog.value = false;
        soba.value = {};
        
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Soba obrisana', life: 3000 });
    } catch (error) {
        console.error("Error deleting soba:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Došlo je do greške prilikom brisanja sobe', life: 5000 });
    }
};


const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < sobe.value.length; i++) {
        if (sobe.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};


const createId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteSobeDialog.value = true;
};

const deleteSelectedSobe = async () => {
    try {
        const ids = selectedSobe.value.map((soba) => soba.id);
        await sobeService.deleteSobe(ids);
        sobe.value = sobe.value.filter((val) => !selectedSobe.value.includes(val));
        deleteSobeDialog.value = false;
        selectedSobe.value = null;

        toast.add({ severity: 'success', summary: 'Successful', detail: 'Sobe obrisane', life: 3000 });
    } catch (error) {
        console.error("Error deleting sobe:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Došlo je do greške prilikom brisanja soba', life: 5000 });
    }
};


const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <!-- <h1>Sobe</h1> -->
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Dodaj" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            <Button label="Briši" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedSobe || !selectedSobe.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Uvoz" class="mr-2 inline-block" />
                        <Button label="Izvoz" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="sobe"
                    v-model:selection="selectedSobe"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sobe">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Pregled soba</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Pretraži..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 1%"></Column>
                    <!-- <Column field="id" header="Id" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Id</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column> -->
                    <Column field="naziv" header="Naziv" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Naziv</span>
                            {{ slotProps.data.naziv }}
                        </template>
                    </Column>
                    <Column header="Slika" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Slika</span>
                            <img :src="slotProps.data.thumbnailImg" :alt="slotProps.data.thumbnailImg" class="shadow-2" width="180" height="180" />
                        </template>
                    </Column>
                    <Column field="brojKreveta" header="Broj kreveta" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Broj kreveta</span>
                            {{ slotProps.data.brojKreveta }}
                        </template>
                    </Column>
                    <Column field="opis" header="Opis" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Opis</span>
                            <span class="wrap-text">{{ slotProps.data.opis }}</span>
                        </template>
                    </Column>
                    <Column field="cijena" header="Cijena (po noćenju)" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Cijena</span>
                            {{ formatCurrency(slotProps.data.cijena) }}
                        </template>
                    </Column>
                    <!-- <Column field="rating" header="Reviews" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Rating</span>
                            <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" />
                        </template>
                    </Column>
                    <Column field="inventoryStatus" header="Status" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <Tag :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Tag>
                        </template>
                    </Column> -->
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editSoba(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteSoba(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="sobaDialog" :style="{ width: '450px' }" :header="soba?.id ? 'Detalji o sobi' : 'Nova soba'" :modal="true" class="p-fluid">
                
                    <div class="field">
                        <label for="naziv">Naziv</label>
                        <InputText id="naziv" v-model.trim="soba.naziv" required="true" autofocus :invalid="submitted && !soba.naziv" />
                        <small class="p-invalid" v-if="submitted && !soba.naziv">Unesite naziv sobe.</small>
                    </div>
                    <div class="field">
                        <label for="brojKreveta">Broj kreveta</label>
                        <InputNumber id="brojKreveta" v-model="soba.brojKreveta" integeronly :invalid="submitted && !soba.brojKreveta"/>
                        <small class="p-invalid" v-if="submitted && !soba.brojKreveta">Unesite broj kreveta.</small>
                    </div>
                    <div class="field">
                        <label for="opis">Opis</label>
                        <Textarea id="opis" v-model="soba.opis" required="true" rows="3" cols="20" />
                    </div>
                    <div class="field">
                        <label for="cijena">Cijena</label>
                        <InputNumber id="cijena" v-model="soba.cijena" mode="decimal" :invalid="submitted && !soba.cijena"/>
                        <small class="p-invalid" v-if="submitted && !soba.cijena">Unesite cijenu.</small>
                    </div>

                    <div class="field">
                        <FileUpload chooseLabel="Odaberi sliku" mode="basic" name="demo[]" accept="image/*" :maxFileSize="10000000" @uploader="onImageSelected" customUpload auto />
                    </div>
                
                    <div class="field" v-if="soba.thumbnailImg">
                        <img :src="soba.thumbnailImg" alt="Image preview" style="max-width: 100%; height: auto;" />
                    </div>

                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" text="" @click="saveSoba" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteSobaDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="soba"
                            >Jeste li sigurni da želite obrisati <b>{{ soba.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteSobaDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteSoba" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteSobeDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="soba">Jeste li sigurni da želite obrisati odabrane sobe?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteSobeDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedSobe" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
