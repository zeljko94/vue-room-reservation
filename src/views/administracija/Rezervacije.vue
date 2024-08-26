<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import { KorisniciService } from '@/service/KorisniciService';
import { AuthService } from '@/service/AuthService';
import { SobeService } from '@/service/SobeService';
import { RezervacijeService } from '@/service/RezervacijeService';
import { useToast } from 'primevue/usetoast';
import { format, isWithinInterval  } from 'date-fns';

const toast = useToast();

const startDate = ref(null);
const endDate = ref(null);
const isEndDateValid = ref(true);
const minDate = ref(new Date());

const rezervacije = ref(null);
const sveRezervacije = ref(null);
const rezervacijaDialog = ref(false);
const deleteRezervacijaDialog = ref(false);
const deleteRezervacijeDialog = ref(false);
const rezervacija = ref(null);
const selectedRezervacije = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);

const authService = new AuthService();
const rezervacijeService = new RezervacijeService();
const korisniciService = new KorisniciService();
const sobeService = new SobeService();

const sobe = ref(null);
const korisnici = ref(null);

const getKorisnikDisplayNameById = (id) => {
    const korisnik = (korisnici.value||[]).find(x => x.id === id);

    return korisnik != undefined ? korisnik.name + ' ' + korisnik.lastName : '';
};

const getSobaDisplayNameById = (id) => {
    const soba = (sobe.value||[]).find(x => x.id === id);

    return soba != undefined ? soba.naziv : '';
};

const validateDates = () => {
    if (rezervacija.value.startDate && rezervacija.value.endDate) {
        const start = normalizeDate(rezervacija.value.startDate);
        const end = normalizeDate(rezervacija.value.endDate);
        isEndDateValid.value = end > start;
    } else {
        isEndDateValid.value = true;
    }

    calculateTotalPrice();
};

const normalizeDate = (date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
};

const calculateTotalPrice = () => {
    if (!rezervacija.value || !rezervacija.value.roomId) return 0;
    const room = sobe.value.find(s => s.id === rezervacija.value.roomId.id);
    const numberOfPeople = rezervacija.value.brojOsoba || 1;
    console.log(rezervacija.value.brojOsoba);
    rezervacija.value.cijena = room ? room.cijena * numberOfPeople : 0;
    return room ? room.cijena * numberOfPeople : 0;
};

onBeforeMount(() => {
    initFilters();
});
onMounted(() => {
    fetchData();
});
const formatCurrency = (value) => {
    return value.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' });
};

const formatDate = (date, dateFormat = 'dd.MM.yyyy.') => {
    if (typeof date === 'string' || date instanceof String) {
        date = Date.parse(date);
    }
    return format(date, dateFormat);
};

const fetchData = () => {
    rezervacijeService.getRezervacije().then((data) => {
        sveRezervacije.value = data;
        rezervacije.value = data;
        if(!authService.isAdmin()) {
            rezervacije.value = rezervacije.value.filter(x => x.userId === authService.getUserId());
        }
    });
    korisniciService.getKorisnici().then((data) => (korisnici.value = data));
    sobeService.getSobe().then((data) => (sobe.value = data));
}

const openNew = () => {
    rezervacija.value = {};
    submitted.value = false;
    rezervacijaDialog.value = true;
};

const hideDialog = () => {
    rezervacijaDialog.value = false;
    submitted.value = false;
};

const saveRezervacija = async () => {
    submitted.value = true;
    validateDates();

    if (!rezervacija.value.roomId || !rezervacija.value.brojOsoba ||
        !rezervacija.value.startDate || !rezervacija.value.endDate || !isEndDateValid.value) {
        return; // Exit early if any required field is missing or invalid
    }

    // Check room availability
    const isRoomAvailable = checkRoomAvailability(rezervacija.value.roomId.id, rezervacija.value.startDate, rezervacija.value.endDate);

    if (!isRoomAvailable) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Željena soba je zauzeta za odabrani period.', life: 5000 });
        return;
    }

    rezervacija.value.startDate = normalizeDate(rezervacija.value.startDate);
    rezervacija.value.endDate = normalizeDate(rezervacija.value.endDate);
    rezervacija.value.userId = authService.getUserId();
    rezervacija.value.roomId = rezervacija.value.roomId.id;
    calculateTotalPrice();

    try {
        if (rezervacija.value.id) {
            // Update existing reservation
            await rezervacijeService.updateRezervacija(rezervacija.value.id, rezervacija.value);
            rezervacije.value[findIndexById(rezervacija.value.id)] = rezervacija.value;
            sveRezervacije.value[findIndexById(rezervacija.value.id)] = rezervacija.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Uspješna izmjena', life: 3000 });
        } else {
            // Create new reservation
            rezervacija.value.id = createId();
            await rezervacijeService.createRezervacija(rezervacija.value);
            rezervacije.value.push(rezervacija.value);
            sveRezervacije.value.push(rezervacija.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Rezervacija kreirana', life: 3000 });
        }

        rezervacijaDialog.value = false;
        rezervacija.value = {};
        delete rezervacija.value.startDate;
        delete rezervacija.value.endDate;
        fetchData();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Došlo je do greške prilikom spremanja rezervacije', life: 5000 });
    }
};

const checkRoomAvailability = (roomId, startDateStr, endDateStr) => {
    // Convert input dates to Date objects
    const startDate = normalizeDate(new Date(startDateStr));
    const endDate = normalizeDate(new Date(endDateStr));


    // Check for overlap in existing reservations
    const overlappingReservation = sveRezervacije.value.find(rezervacija => {
        const reservationStart = new Date(rezervacija.startDate);
        const reservationEnd = new Date(rezervacija.endDate);


        // Check for overlap
        return rezervacija.roomId === roomId &&
            (startDate < reservationEnd && endDate > reservationStart);
    });

    // Return true if no overlap is found, meaning the room is available
    return overlappingReservation == undefined;
};




const editRezervacija = (editRezervacija) => {
    rezervacija.value = { ...editRezervacija };
    rezervacijaDialog.value = true;
};

const confirmDeleteRezervacija = (editRezervacija) => {
    rezervacija.value = editRezervacija;
    deleteRezervacijaDialog.value = true;
};

const deleteRezervacija = async () => {
    try {
        await rezervacijeService.deleteRezervacija(rezervacija.value.id);
        rezervacije.value = rezervacije.value.filter((val) => val.id !== rezervacija.value.id);
        sveRezervacije.value = rezervacije.value.filter((val) => val.id !== rezervacija.value.id);
        deleteRezervacijaDialog.value = false;
        rezervacija.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Rezervacija obrisana', life: 3000 });
        fetchData();
    }
    catch(error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Došlo je do greške prilikom brisanja korisnika', life: 5000 });
    }
};


const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < rezervacije.value.length; i++) {
        if (rezervacije.value[i].id === id) {
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
    deleteRezervacijeDialog.value = true;
};
const deleteSelectedRezervacije = () => {
    rezervacije.value = rezervacije.value.filter((val) => !selectedRezervacije.value.includes(val));
    sveRezervacije.value = rezervacije.value.filter((val) => !selectedRezervacije.value.includes(val));
    deleteRezervacijeDialog.value = false;
    selectedRezervacije.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Rezervacije obrisane', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <!-- <h1>Rezervacije</h1> -->
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Nova rezervacija" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
                            <Button label="Obriši" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected" :disabled="!selectedRezervacije || !selectedRezervacije.length" />
                        </div>
                    </template>

                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Uvoz" class="mr-2 inline-block" />
                        <Button label="Izvoz" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="rezervacije"
                    v-model:selection="selectedRezervacije"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} rezervacije"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Pregled rezervacija</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Pretraži..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <!-- <Column field="id" header="Id" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Id</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column> -->
                    <Column field="korisnik" header="Korisnik" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Korisnik</span>
                            {{ getKorisnikDisplayNameById(slotProps.data.userId) }}
                        </template>
                    </Column>

                    <Column field="soba" header="Soba" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Soba</span>
                            {{ getSobaDisplayNameById(slotProps.data.roomId) }}
                        </template>
                    </Column>

                    <Column field="datumPocetka" header="Datum početka" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Datum početka</span>
                            {{ formatDate(slotProps.data.startDate) }}
                        </template>
                    </Column>
                    <Column field="datumZavrsetka" header="Datum završetka" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Datum završetka</span>
                            {{ formatDate(slotProps.data.endDate) }}
                        </template>
                    </Column>

                    <Column field="brojOsoba" header="Broj osoba" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Broj osoba</span>
                            {{ slotProps.data.brojOsoba }}
                        </template>
                    </Column>
                    
                    <Column field="cijena" header="Cijena" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Cijena</span>
                            {{ formatCurrency(slotProps.data.cijena) }}
                        </template>
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editRezervacija(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteRezervacija(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="rezervacijaDialog" :style="{ width: '450px' }" header="Detalji rezervacije" :modal="true" class="p-fluid">
                    <!-- <img :src="'/demo/images/rezervacija/' + rezervacija.image" :alt="rezervacija.image" v-if="rezervacija.image" width="150" class="mt-0 mx-auto mb-5 block shadow-2" /> -->
                    <div>
                        <div class="field">
                          <label for="startDate" class="mb-3">Početni datum</label>
                          <Calendar 
                            id="startDate" 
                            v-model="rezervacija.startDate" 
                            :minDate="minDate"
                            placeholder="Odaberite početni datum" 
                            :invalid="submitted && !rezervacija.startDate" 
                            @change="validateDates" 
                          />
                          <small class="p-invalid" v-if="submitted && !rezervacija.startDate">Odaberite početni datum.</small>
                        </div>
                        
                        <div class="field">
                          <label for="endDate" class="mb-3">End Date</label>
                          <Calendar 
                            id="endDate" 
                            v-model="rezervacija.endDate" 
                            :minDate="minDate"
                            placeholder="Odaberite završni datum" 
                            :invalid="submitted && (!rezervacija.endDate || !isEndDateValid)" 
                            @change="validateDates" 
                          />
                          <small class="p-invalid" v-if="submitted && (!rezervacija.endDate || !isEndDateValid)">
                            {{ !rezervacija.endDate ? 'Odaberite završni datum.' : 'Završni datum mora biti poslije početnog datuma.' }}
                          </small>
                        </div>
                      </div>
                

                    <!-- <div class="field" v-if="authService.isAdmin()">
                        <label for="role" class="mb-3">Korisnik</label>
                        <Dropdown id="userId" v-model="rezervacija.userId" :options="korisnici" optionLabel="name" placeholder="Odaberite korisnika" :invalid="submitted && !rezervacija.userId">
                          <template #value="slotProps">
                            <span>{{ slotProps.value ? slotProps.value.name : slotProps.placeholder }}</span>
                          </template>
                        </Dropdown>
                        <small class="p-invalid" v-if="submitted && !rezervacija.userId">Izaberite korisnika.</small>
                    </div> -->

                    
                    <div class="field">
                        <label for="role" class="mb-3">Soba</label>
                        <Dropdown id="roomId" v-model="rezervacija.roomId" @change="calculateTotalPrice" :options="sobe" optionLabel="naziv" placeholder="Odaberite sobu" :invalid="submitted && !rezervacija.roomId">
                          <template #value="slotProps">
                            <span>{{ slotProps.value ? slotProps.value.naziv : slotProps.placeholder }}</span>
                          </template>
                        </Dropdown>
                        <small class="p-invalid" v-if="submitted && !rezervacija.roomId">Izaberite sobu.</small>
                    </div>

                    <div class="field">
                        <label for="brojOsoba">Broj osoba</label>
                        <InputNumber id="brojOsoba" @input="calculateTotalPrice" v-model="rezervacija.brojOsoba" :min="1" integeronly :invalid="submitted && !rezervacija.brojOsoba"/>
                        <small class="p-invalid" v-if="submitted && !rezervacija.brojOsoba">Unesite broj osoba.</small>
                    </div>



                    <div class="field">
                        <label for="cijena" style="font-weight: bold;font-size: 16px;">TOTAL: &nbsp;</label>
                        <span style="font-size: 16px;">{{formatCurrency(rezervacija.cijena || 0)}}</span>
                        <!-- <InputNumber  readonly="true" id="cijena" v-model="rezervacija.cijena" integeronly :invalid="submitted && !rezervacija.cijena"/> -->
                    </div>



                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" text="" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" text="" @click="saveRezervacija" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteRezervacijaDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="rezervacija"
                            >Are you sure you want to delete <b>{{ rezervacija.name }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteRezervacijaDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteRezervacija" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteRezervacijeDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="rezervacija">Are you sure you want to delete the selected rezervacije?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteRezervacijeDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedRezervacije" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
