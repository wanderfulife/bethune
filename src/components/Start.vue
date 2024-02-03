<template>
	<div class="container">
		<div v-if="level === 0">
			<h2>Prénom enqueteur :</h2>
			<input class="form-control" type="text" v-model="enqueteur" />
			<button v-if="enqueteur" @click="next" class="btn-next">Suivant</button>
		</div>

		<div v-if="level === 1">
			<h3>
				Bonjour,<br><br> Dans le quadre d'un projet de rénovation<br><br> Nous avons été missionnés par le Centre
				Commercial Auchan
				pour mener une enquête sur vos fréquences d'achat.<br><br>
				Accepteriez-vous de répondre rapidement à 4 questions ?
			</h3>
			<button @click="startSurvey" class="btn-next">COMMENCER QUESTIONNAIRE</button>
		</div>

		<div v-if="level === 2" class="form-group">
			<h2>Indiquer le poste d'enquête</h2>
			<select v-model="poste" class="form-control">
				<option v-for="option in postes" :key="option.id" :value="option.output">
					{{ option.text }}
				</option>
			</select>
			<button v-if="poste" @click="next" class="btn-next">Suivant</button>
			<button @click="back" class="btn-return">retour</button>
		</div>

		<div v-if="level === 3" class="form-group">
			<h2>Fréquentez-vous l'Hypermarché,<br> la galerie marchande ou les deux ?</h2>
			<select v-model="q1" class="form-control">
				<option v-for="option in achat" :key="option.id" :value="option.output">
					{{ option.text }}
				</option>
			</select>
			<button v-if="q1" @click="next" class="btn-next">Suivant</button>
			<button @click="back" class="btn-return">retour</button>
		</div>

		<div v-if="level === 4" class="form-group">
			<h2>Quel moyen de locomotion avez-vous utilisé ?</h2>
			<select v-model="selectedTransport" class="form-control">
				<option v-for="option in transport" :key="option.id" :value="option.output">
					{{ option.text }}
				</option>
			</select>
			<input v-if="selectedTransport === 'Autre'" class="form-control" type="text" v-model="precision"
				placeholder="Précisions">
			<button v-if="selectedTransport" @click="next" class="btn-next">Suivant</button>
			<button @click="back" class="btn-return">Retour</button>
		</div>

		<div v-if="level === 5" class="form-group">
			<h2>Fréquentez-vous d'autres enseignes de la zone commerciale <br> lors de votre venue Centre Commerciale? </h2>
			<select v-model="q3" class="form-control">
				<option v-for="option in visite" :key="option.id" :value="option.output">
					{{ option.text }}
				</option>
			</select>
			<button v-if="q3 === 'Non'" @click="submitSurvey" class="btn-next">Fin</button>
			<button v-if="q3 === 'Oui'" @click="next" class="btn-next">Suivant</button>
			<button @click="back" class="btn-return">retour</button>
		</div>
		<div v-if="q3 === 'Oui' && level === 6" class="form-group">
			<h2>Si oui Lesquelles ?</h2>
			<select v-model="selectedEnseigne" class="form-control">
				<option v-for="option in enseigne" :key="option.id" :value="option.output">
					{{ option.text }}
				</option>
			</select>
			<input v-if="selectedEnseigne === 'Autre'" class="form-control" type="text" v-model="precisionEnseigne"
				placeholder="Précisions">
			<button v-if="selectedEnseigne" @click="submitSurvey" class="btn-next">Fin</button>
			<button @click="back" class="btn-return">Retour</button>
		</div>
		<img class="logo" src="../assets/Alycelogo.webp" alt="Logo Alyce">
		<!-- <button class="btn-fin" @click="downloadData">download DATA</button> -->
	</div>
</template>



<script setup>
import { ref, watch, onMounted } from 'vue';
import { db } from "../firebase/init";
import { postes, achat, transport, visite, enseigne } from "./reponses"
import { collection, doc, getDoc, getDocs, updateDoc, addDoc } from "firebase/firestore";
import * as XLSX from "xlsx";

const surveyCollectionRef = collection(db, "Bethune");
const surveyNumber = ref(0); // collect onMount\
const level = ref(0);
const startDate = ref('');
const enqueteur = ref('');
const poste = ref('');
const q1 = ref('');
const q2 = ref('');
const q3 = ref('');
const q4 = ref('');
const selectedTransport = ref('');
const precision = ref(''); // A new ref to hold the precision input
const selectedEnseigne = ref('');
const precisionEnseigne = ref('');


// Faire des modules separes pour creer une app rapidement.
// tester en mode prod


// Watch both selectedTransport and precision to handle the case where "other" is selected
watch([selectedTransport, precision], () => {
	if (selectedTransport.value === 'Autre' && precision.value) {
		q2.value = `Autre: ${precision.value}`;
	} else {
		q2.value = selectedTransport.value;
	}
}, { immediate: true });

watch([selectedEnseigne, precisionEnseigne], () => {
	if (selectedEnseigne.value === 'Autre' && precisionEnseigne.value) {
		q4.value = `Autre: ${precisionEnseigne.value}`;
	} else {
		q4.value = selectedEnseigne.value;
	}
}, { immediate: true });


// Function to fetch the current survey number from Firebase
// Function to fetch the current survey number from Firebase
const fetchSurveyNumber = async () => {
	const surveyRef = doc(db, "enquete-bethune", "enquete");
	const docSnap = await getDoc(surveyRef);
	if (docSnap.exists() && docSnap.data().numero !== undefined) {
		surveyNumber.value = docSnap.data().numero;
	} else {
		console.log("No such document or 'numero' field is missing!");
	}
};

// Function to increment and update the survey number in Firebase
const updateSurveyNumber = async () => {
	const newNumber = surveyNumber.value + 1; // Increment the survey number
	const surveyRef = doc(db, "enquete-bethune", "enquete");
	await updateDoc(surveyRef, {
		numero: newNumber
	});
	surveyNumber.value = newNumber; // Update the local ref
};

// Fetch the current survey number when component is mounted
onMounted(fetchSurveyNumber);

const startSurvey = () => {
	startDate.value = new Date().toLocaleTimeString("fr-FR").slice(0, 8);
	level.value++;
}

const next = () => {
	level.value++;
}

const back = () => {
	level.value--;
}

const submitSurvey = async () => {
	level.value = 1;
	await addDoc(surveyCollectionRef, {
		HEURE_DEBUT: startDate.value,
		NUM_ENQUETE: surveyNumber.value,
		HEURE_FIN: new Date().toLocaleTimeString("fr-FR").slice(0, 8),
		POSTE: poste.value,
		DATE: new Date().toLocaleDateString("fr-FR").replace(/\//g, "-"),
		ENQUETEUR: enqueteur.value,
		Q1: q1.value,
		Q2: q2.value,
		Q3: q3.value,
		Q4: q4.value
	});
	startDate.value = "";
	poste.value = "";
	q1.value = "";
	q2.value = "";
	q3.value = "";
	q4.value = "";
	selectedTransport.value = "";
	precision.value = "";
	selectedEnseigne.value = "";
	precisionEnseigne.value = "";
	await updateSurveyNumber();
};

const downloadData = async () => {
	try {
		const querySnapshot = await getDocs(surveyCollectionRef);
		let data = [];
		let maxWidths = {}; // Object to keep track of maximum width for each column

		// Define your headers
		const headers = {
			ID_questionnaire: "ID_questionnaire",
			Enquete: "NUM_ENQUETE",
			Enqueteur: "Enqueteur",
			DATE: "DATE",
			HEURE: "HEURE",
			HEURE_FIN: "HEURE_FIN",
			Q1: "q1",
			Q2: "q2",
			Q3: "q3",
			Q4: "q4"
		};

		// Initialize maxWidths with header lengths
		Object.keys(headers).forEach((key) => {
			maxWidths[key] = headers[key].length;
		});

		querySnapshot.forEach((doc) => {
			let docData = doc.data();
			let mappedData = {
				ID_questionnaire: doc.id,
				Enqueteur: docData.ENQUETEUR || "",
				Enquete: docData.NUM_ENQUETE || "",
				DATE: docData.DATE || "",
				HEURE: docData.HEURE_DEBUT || "",
				HEURE_FIN: docData.HEURE_FIN || "",
				Q1: docData.Q1 || "",
				Q2: docData.Q2 || "",
				Q3: docData.Q3 || "",
				Q4: docData.Q4 || ""
			};
			data.push(mappedData);
			// Update maxWidths for each key in mappedData
			Object.keys(mappedData).forEach((key) => {
				const valueLength = mappedData[key].toString().length;
				maxWidths[key] = Math.max(maxWidths[key], valueLength);
			});
		});
		// Convert data to a worksheet
		const worksheet = XLSX.utils.json_to_sheet(data, {
			header: Object.keys(headers),
			skipHeader: false,
		});
		// Set the widths for each column
		worksheet["!cols"] = Object.keys(maxWidths).map((key) => ({
			wch: maxWidths[key] + 2 // +2 for a little extra padding
		}));
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
		// Export the workbook to a .xlsx file
		XLSX.writeFile(workbook, "Bethune.xlsx");
	} catch (error) {
		console.error("Error downloading data: ", error);
	}
};
</script>

<style>
body {
	background-color: #2a3b63;
}

.logo {
	padding: 10%;
	height: 3em;
}

h1 {
	text-align: center;
	color: #4caf50;
}

h2 {
	color: white;
}

.container {
	background-color: #2a3b63;
	color: white;
	padding: 5% 0;
	width: 75%;
	margin: auto;
}

.btn-next {
	width: 100%;
	background-color: green;
	color: white;
	padding: 20px 20px;
	margin-top: 20%;
	border: none;
	border-radius: 5px;
	cursor: pointer;
}

.btn-fin {
	width: 100%;
	background-color: #4c4faf;
	color: white;
	padding: 20px 20px;
	margin-top: 20%;
	border: none;
	border-radius: 5px;
	cursor: pointer;
}

.btn-return {
	width: 100%;
	background-color: #898989;
	color: white;
	padding: 20px 20px;
	margin-top: 20%;
	border: none;
	border-radius: 5px;
	cursor: pointer;
}

.btn-return:hover {
	background-color: #839684;
}

.commune-dropdown {
	/* Style your dropdown list here */
	list-style-type: none;
	padding: 0;
	margin: 0;
	border: 1px solid #ccc;
	border-radius: 4px;
	max-height: 200px;
	overflow-y: auto;
}

.form-control {
	width: 100%;
	border-radius: 5px;
	border: 1px solid white;
	background-color: #333;
	color: white;
	text-transform: uppercase;
	font-weight: bolder;
}

input.form-control {
	width: 93%;
}

.commune-dropdown li {
	padding: 5px 10px;
	cursor: pointer;
}

*:focus {
	outline: none;
}

.commune-dropdown li:hover {
	background-color: #f0f0f0;
}

input,
select,
button {
	font-size: 16px;
	padding: 10px;
}
</style>