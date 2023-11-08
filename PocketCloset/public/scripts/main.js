var rhit = rhit || {};

rhit.FB_COLLECTION_CLOTHING = "Clothing";
rhit.FB_KEY_URL = "url";
rhit.FB_KEY_TYPE_OF_CLOTHING = "type";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_USER = "user";

rhit.fbPhotosManager = null;
rhit.FbSingleUrlManager = null;
rhit.fbAuthManager = null;


function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


rhit.ListPageController = class {
	constructor() {

		this.clothingItems = {
			tops: [],
			bottoms: [],
			shoes: [],
			eyewear: [],
			accessories: []
		};


		document.querySelector("#menuTops").addEventListener("click", (event) => {
			console.log("tops");
			// this.hideAllImages();
			this.showClothingItems("tops");
		});

		document.querySelector("#menuBottoms").addEventListener("click", (event) => {
			console.log("bottoms");
			// this.hideAllImages();
			this.showClothingItems("bottoms");
		});

		document.querySelector("#menuShoes").addEventListener("click", (event) => {
			console.log("shoes");
			// this.hideAllImages();
			this.showClothingItems("shoes");
		});

		document.querySelector("#menuEyewear").addEventListener("click", (event) => {
			console.log("eyewear");
			// this.hideAllImages();
			this.showClothingItems("eyewear");
		});

		document.querySelector("#menuAccessories").addEventListener("click", (event) => {
			console.log("accessories");
			// this.hideAllImages();
			this.showClothingItems("accessories");
		});


		document.querySelector("#submitAddPhoto").addEventListener("click", (event) => {
			const url = document.querySelector("#inputUrl").value;
			const rButtons = document.getElementsByName("type");
			let type = rButtons[0];
			for (let i = 0; i < rButtons.length; i++) {
				if (rButtons[i].checked) {
					type = (rButtons[i].value);
				}
			}

			rhit.fbPhotosManager.add(url, type);
		})

		$("#addDialog").on("show.bs.modal", (event) => {
			//pre animation
			document.querySelector("#inputUrl").value = "";
			// document.querySelector("#inputCaption").value = "";
		});
		$("#addDialog").on("shown.bs.modal", (event) => {
			//post animation
			document.querySelector("#inputUrl").focus();

		});

		//start listening
		rhit.fbPhotosManager.beginListening(this.updateList.bind(this));
	}


	// showImagesByType(type) {
	// 	const images = document.querySelectorAll(`.pin img[data-type='${type}']`);
	// 	images.forEach((img) => {
	// 		img.style.display = "block";
	// 	});
	// }

	_createCard(picture) {
		const card = htmlToElement(`<img
			  draggable="true"
			  ondragstart="drag(event)" id="image${picture.id}" data-type="${picture.type}" alt="poster" src="${picture.url}">
			`);
		// new DraggableImage(card.querySelector('img'));
		card.addEventListener("dragstart", onDragStart);

		return card;
	}

	createCategoryCard(item) {

		const card = htmlToElement(`
				<div
				id="draggable-1"
				class="pin"
				draggable="true"
				ondragstart="drag(event)"
			  >
						<img 
						draggable="true"
						ondragstart="drag(event)" id="image${item.id}" data-type="${item.type}" alt="poster" src=${item.url}>
					</div>
				`);
		card.onclick = (event) => {
			window.location.href = `/photodetail.html?id=${item.id}`;
		}
		return card;
	}



	showClothingItems(category) {
		const menuClothingType = document.querySelector("#menuClothingType");
		menuClothingType.innerHTML = '';

		this.clothingItems[category].forEach((item) => {
			menuClothingType.appendChild(this.createCategoryCard(item));
		});
	}


	updateList() {
		console.log("updating list");
		const newList = htmlToElement(`<div id='listPageContainer'></div>`);
		for (let i = 0; i < rhit.fbPhotosManager.length; i++) {
			const mq = rhit.fbPhotosManager.fbPhotosManager(i);
			const newCard = this._createCard(mq);

			// Store the clothing item in the corresponding category
			this.clothingItems[mq.type].push(mq);

			newCard.onclick = (event) => {
				window.location.href = `/photodetail.html?id=${mq.id}`;
			}

			newList.appendChild(newCard);
		}
		const oldList = document.querySelector("#listPageContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

}

rhit.PhotoType = class {
	constructor(id, url, type) {
		this.id = id;
		this.url = url;
		this.type = type;
	}
}

rhit.FbPhotosManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_CLOTHING);
		this._unsubscribe = null;
	}
	add(url, type) {


		this._ref.add({
				[rhit.FB_KEY_URL]: url,
				[rhit.FB_KEY_TYPE_OF_CLOTHING]: type,
				[rhit.FB_KEY_USER]: rhit.fbAuthManager.uid,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function (docRef) {
				console.log("Document written with ID", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document", error);
			});

	}
	beginListening(changeListener) {

		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);

		if (this._uid) {
			query = query.where(rhit.FB_KEY_USER, "==", this._uid);
		}


		this._unsubscribe = query.onSnapshot((querySnapshot) => {

			this._documentSnapshots = querySnapshot.docs;

			changeListener();

		});
	}
	stopListening() {
		this._unsubscribe();
	}
	get length() {
		return this._documentSnapshots.length;
	}
	fbPhotosManager(index) {
		const docSnapshot = this._documentSnapshots[index];
		const type = new rhit.PhotoType(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_URL),
			docSnapshot.get(rhit.FB_KEY_TYPE_OF_CLOTHING),
		);
		return type;
	}
}



rhit.DetailPageController = class {
	constructor() {
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#menuEdit").addEventListener("click", (event) => {
			console.log("Edit button clicked");
		});

		document.querySelector("#menuDelete").addEventListener("click", (event) => {
			console.log("Delete button clicked");
		});

		document.querySelector("#submitEditCaption").onclick = (event) => {
			const url = document.querySelector("#inputCaption").value;
			rhit.FbSingleUrlManager.update(url);
		};

		$("#editCaption").on("shown.bs.modal", (event) => {
			document.querySelector("#inputCaption").focus();
		})

		$("#editCaption").on("show.bs.modal", (event) => {
			document.querySelector("#inputCaption").value = rhit.FbSingleUrlManager.caption;
		})


		document.querySelector("#submitDeletePhoto").addEventListener("click", (event) => {

			rhit.FbSingleUrlManager.delete().then(function () {
				console.log("document sucessfully deleted:")
				window.location.href = `/outfit.html?uid=${rhit.fbAuthManager.uid}`;
			}).catch(function (error) {
				console.error("Error removing document: ", error);
			});
		});

		rhit.FbSingleUrlManager.beginListening(this.updateView.bind(this));
	}
	updateView() {
		document.querySelector("#cardPhoto").src = rhit.FbSingleUrlManager.url;

		if (rhit.FbSingleUrlManager.author == rhit.FbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
	}
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.FbAuthManager.signIn();

		};
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}


	beginListening(changeListener) {

		firebase.auth().onAuthStateChanged((user) => {

			this._user = user;
			changeListener();


		});
	}

	signIn() {
		console.log("no user signed in")
		Rosefire.signIn("5dd05dcd-c1fe-49be-b3e5-669f137e3d13", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);


			firebase.auth().signInWithCustomToken(rfUser.token)
				.catch((error) => {
					const errorCode = error.code;
					const errorMessage = error.message;

					if (errorCode === 'auth/invalid-custom-token') {
						alert('The token you provided is not valid.');
					} else {
						console.error("custom auth error", errorCode, errorMessage)
					}
				});

		});
	}

	signOut() {
		console.log("signing out");
		firebase.auth().signOut();
		console.log("signing out");
	}


	get isSignedIn() {
		return !!this._user
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.FbSingleUrlManager = class {
	constructor(photoID) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_CLOTHING).doc(photoID);
		console.log(`listening to ${this._ref.path}`);
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data);
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("no such document");
			}
		});

	}

	update(url) {
		this._ref.update({

				[rhit.FB_KEY_URL]: url,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(() => {
				console.log("Document Successfully updated");
			})
			.catch(function (error) {
				console.log("Error updating document", error);
			})
	}
	stopListening() {
		this._unsubscribe();
	}
	delete() {
		return this._ref.delete();
	}

	get url() {
		return this._documentSnapshot.get(rhit.FB_KEY_URL);
	}

	get type() {
		return this._documentSnapshot.get(rhit.FB_KEY_TYPE_OF_CLOTHING);
	}
	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_USER);
	}
}


rhit.checkForRedirects = function () {

	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = `/outfit.html?uid=${rhit.fbAuthManager.uid}`;
	}

	if (!document.querySelector("#loginPage") && !(rhit.fbAuthManager.isSignedIn)) {

		window.location.href = "/";
	}

};
rhit.initalizePage = function () {
	const urlParams = new URLSearchParams(window.location.search);

	if (document.querySelector("#listPage")) {
		const uid = urlParams.get("uid");
		rhit.fbPhotosManager = new rhit.FbPhotosManager(uid);
		new rhit.ListPageController();
	}
	if (document.querySelector("#photodetail")) {
		const url = urlParams.get("id");
		if (!url) {
			window.location.href = `/outfit.html?uid=${rhit.fbAuthManager.uid}`;
		}
		rhit.FbSingleUrlManager = new rhit.FbSingleUrlManager(url);
		new rhit.DetailPageController();
	}
	if (document.querySelector("#loginPage")) {
		console.log("You are on the Login Page");
		new rhit.LoginPageController();
		rhit.startFirebaseUI();
	}


}


rhit.main = function () {
	
	// .catch(err => console.log("wrong city name"));


	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening((event) => {
		rhit.checkForRedirects();
		rhit.initalizePage();
		rhit.weather();
	});

	document.addEventListener('DOMContentLoaded', function() {
		navigateToSpecificLink();
	  });


}


rhit.startFirebaseUI = function () {

	var uiConfig = {
		signInSuccessUrl: '/',
		signInOptions: [
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		],

	};

	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	ui.start('#firebaseui-auth-container', uiConfig);

}

// class DraggableImage {
// 	constructor(imgElement) {
// 	  this.imgElement = imgElement;
// 	  this.imgElement.setAttribute('draggable', true);
// 	  this.imgElement.addEventListener('dragstart', this.onDragStart.bind(this));
// 	}

// 	onDragStart(event) {
// 	  event.dataTransfer.setData('text/plain', this.imgElement.id);
// 	}
//   }

function navigateToSpecificLink() {
	var navbarBrand = document.querySelector('.navbar-brand');
  
	navbarBrand.addEventListener('click', function() {
	  window.location.href = `/outfit.html?uid=${rhit.fbAuthManager.uid}`; 
	});
  }

function onDragStart(event) {
	event.dataTransfer.setData("text/plain", event.target.id);
	event.target.style.opacity = "0.5";
}

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	console.log(data);
	console.log(ev.target);
	ev.target.appendChild(document.getElementById(data));
}

rhit.weather = function () {
	// Weather API Stuff
	fetch(`https://cors-anywhere.herokuapp.com/http://cors-anywhere.api.weatherapi.com/v1/current.json?key=0f955d09433f415e96515210230811&q=terre haute&aqi=yes`)
		.then(response => response.json())
		.then(data => {
			console.log(data)

		})
		
		
	// let inputText;
	// let cityName = prompt("Please enter your city name:");
	// if (cityName == null || cityName == "") {
	//   inputText = "User cancelled the prompt.";
	// } else {
	//   inputText = "The weather is {temperature}" + " in " + cityName;
	// }
	// document.getElementById("weather").innerHTML = inputText;
}

// function onDrop(event) {
// 	event
// 		.dataTransfer
// 		.clearData();
// }

// function onDragOver(event) {
// 	event.preventDefault();
//   }


rhit.main();