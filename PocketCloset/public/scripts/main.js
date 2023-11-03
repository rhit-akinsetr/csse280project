var rhit = rhit || {};

rhit.FB_COLLECTION_CLOTHING = "Clothing";
rhit.FB_KEY_URL = "url";
rhit.FB_KEY_TYPE_OF_CLOTHING = "type";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_USER = "user";

rhit.fbPhotosManager = null;
rhit.FbSingleTypeManager = null;
rhit.fbAuthManager = null;


function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


rhit.ListPageController = class {
	constructor() {


		document.querySelector("#menuTops").addEventListener("click", (event) => {
			console.log("tops");
			
			document.querySelector("#menuClothingType").innerHTML = '<div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"><img id="drag1" src="images/shirt.jpg" draggable="true" ondragstart="drag(event)" width="336" height="69"></div>';
			
		});
		document.querySelector("#menuBottoms").addEventListener("click", (event) => {
			console.log("bottoms");
			document.querySelector("#menuClothingType").innerHTML = '<div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"><img id="drag2" src="images/pants.jpg" draggable="true" ondragstart="drag(event)" width="336" height="69"></div>';
		});
		document.querySelector("#menuShoes").addEventListener("click", (event) => {
			console.log("shoes");
			document.querySelector("#menuClothingType").innerHTML = '<div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"><img id="drag3" src="images/shoes.jpg" draggable="true" ondragstart="drag(event)" width="336" height="69"></div>';
		});
		document.querySelector("#menuEyewear").addEventListener("click", (event) => {
			console.log("eyewear");
			document.querySelector("#menuClothingType").innerHTML = '<div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"><img id="drag4" src="images/eyewear.jpg" draggable="true" ondragstart="drag(event)" width="336" height="69"></div>';
		});
		document.querySelector("#menuAccessories").addEventListener("click", (event) => {
			console.log("accessories");
			document.querySelector("#menuClothingType").innerHTML = '<div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"><img id="drag5" src="images/belt.jpg" draggable="true" ondragstart="drag(event)" width="336" height="69"></div>';
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#submitAddPhoto").addEventListener("click", (event) => {
			const url = document.querySelector("#inputUrl").value;
			const rButtons = document.getElementsByName("type");
			let type = rButtons[0];
			for( let i = 0; i<rButtons.length; i++){
				if(rButtons[i].checked){
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
	_createCard(picture) {
		return htmlToElement(` <div class="pin">
		  <img id="cardPoster" class="img-fluid card-img-bottom" draggable="true" ondragstart="drag(event)" alt="poster" src=${picture.url}>
         <p class="card-text text-center">${picture.type}</p>
        </div>`);
	}
	updateList() {
		console.log("updating list");
		const newList = htmlToElement(`<div id='listPageContainer'></div>`);
		for (let i = 0; i < rhit.fbPhotosManager.length; i++) {
			const mq = rhit.fbPhotosManager.fbPhotosManager(i);
			const newCard = this._createCard(mq);

			newCard.onclick = (event) => {

				window.location.href = `/photo.html?id=${mq.id}`

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

		document.querySelector("#submitDelete").addEventListener("click", (event) => {

			rhit.FbSingleCaptionManager.delete().then(function () {
				console.log("document sucessfully deleted:")
				window.location.href = "/";
			}).catch(function (error) {
				console.error("Error removing document: ", error);
			});
		})

		rhit.FbSingleCaptionManager.beginListening(this.updateView.bind(this));
	}
	updateView() {


		document.querySelector("#cardUrl").src = rhit.FbSingleCaptionManager.url;
		document.querySelector("#cardCaption").innerHTML = rhit.FbSingleCaptionManager.caption;

		if (rhit.FbSingleCaptionManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";

			document.querySelector("#menuDelete").style.display = "flex";

		}


	}
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();

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

rhit.FbSingleTypeManager = class {
	constructor(photoID) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_CLOTHING).doc(photoID);
		console.log(`listening to ${this._ref.path}`);
	}

	 

	beginListening(changeListener) {


		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data)
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("no such document");
			}
		});



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
		window.location.href = "/outfit.html";
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
	if (document.querySelector("#detailPage")) {



		const photoID = urlParams.get("id");

		console.log(`Detail page is for ${photoID}`);
		if (!photoID) {
			console.log("ERROR: missing picture caption id");
			window.location.href = "/";
		}
		rhit.FbSingleCaptionManager = new rhit.FbSingleCaptionManager(photoID);
		new rhit.DetailPageController();

	}
	if (document.querySelector("#loginPage")) {
		new rhit.LoginPageController();
		rhit.startFirebaseUI();
	}

}


rhit.main = function () {
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening((event) => {
		rhit.checkForRedirects();
		rhit.initalizePage();
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

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	ev.target.appendChild(document.getElementById(data));
}

function onDragStart(event) {
	event
		.dataTransfer
		.setData('text/plain', event.target.id);

	event
		.currentTarget
		.style
		.backgroundColor = 'yellow';
}

function onDrop(event) {
	event
		.dataTransfer
		.clearData();
}


rhit.main();