Vue.component("image-modal", {
    props: ["image"],
    template: `<div class="image-modal-container">
        <div class="image-modal">
        <div v-on:click="close" class="image-modal-close">&times;</div>
        <img class="image-modal-image" v-bind:src="image.url"/>
        <div class="image-modal-title">{{image.title}}</div>
        <div class="image-modal-description">{{image.description}}</div>
        <div class="image-modal-username-date">{{image.username}} at {{image.created_at}}</div>
        <div class="add-comment">Add a comment!</div>
        <form v-on:submit="addComment" class="addComment">
            <input v-model="comment" class="addComment-comment" type="text" placeholder="comment" required/>
            <input v-model="username" class="addComment-username" type="text" placeholder="username" required/>
            <button class="addComment-submit" type="submit">submit</button>
        </form>
            <div v-for="c in comments" class="comment">
                <div>{{c.comment}}!</div>
                <div>{{c.username}} at {{c.created_at}}</div>
            </div>
        </div>
    </div>`,
    methods: {
        close: function() {
            this.$emit("close");
        },
        addComment: function(e) {
            e.preventDefault();
            axios
                .post("/addComment", {
                    imageId: this.image.id,
                    comment: this.comment,
                    username: this.username
                })
                .then(res => {
                    this.comments.unshift({
                        username: this.username,
                        comment: this.comment,
                        created_at: res.data.created_at
                    });

                    this.username = "";
                    this.comment = "";
                    this.created_at = "";
                });
        }
    },
    data: function() {
        return {
            comment: "",
            username: "",
            comments: []
        };
    },

    //watcher is a function that runs whenever a PROP has changed!//

    //watch: {
    //     imageId: function() {
    //             this function runs whenever id in url changes
    //      console.log("imageId has changed!");
    //     axios request to get image and comments
    //     }
    // },

    mounted: function() {
        axios.get(`/seeComment/${this.image.id}`).then(res => {
            this.comments = res.data;
        });
    }
});

new Vue({
    el: "#main",
    data: {
        cards: [],
        //imageId: location.hash.slice(1) || 0;//
        //the default value of imageId should be the id in the url IF THERE IS ONE!
        //if there insn't one -- just default to 0, like before.
        upload: {},
        pageNames: [
            "retrato",
            "fotografijo",
            "bild",
            "picture",
            "photo",
            "fotografie",
            "fotografija",
            "bilde",
            "fotografering",
            "fotografije",
            "fotografía",
            "kuva",
            "fotografia",
            "foto",
            "immagine",
            "gambar",
            "slika",
            "kartinka"
        ],
        currentPageName: 0,
        modalImage: null
    },
    methods: {
        handleFileChange: function(e) {
            this.upload.file = e.target.files[0];
        },

        openModal: function(card) {
            this.modalImage = card;
        },

        closeModal: function() {
            this.modalImage = null;
        },

        uploadImage: function(e) {
            e.preventDefault();
            const formData = new FormData();
            formData.append("file", this.upload.file);
            formData.append("title", this.upload.title);
            formData.append("username", this.upload.username);
            formData.append("description", this.upload.description);
            axios
                .post("/uploadImage", formData, {
                    headers: {
                        "content-type": "multipart/form-data"
                    }
                })
                .then(response => {
                    this.cards.unshift({
                        title: this.upload.title,
                        description: this.upload.description,
                        username: this.upload.username,
                        url: response.data.url,
                        id: response.data.id,
                        created_at: response.data.created_at
                    });
                    this.upload.title = "";
                    this.upload.description = "";
                    this.upload.username = "";
                    this.upload.file = null;
                });
        }
    },
    mounted: function() {
        // var self = this;
        // //hashchange event fires every time the number following
        // //the hash in the url changes//
        // window.addEventListener("hashchange", function() {
        //     console.log("location: ", location.hash);
        // remove the hash symbol and get just the number
        // console.log('location.hash.slice(1): ',
        // location.hash.slice(1))
        // self.card = location.hash.slice(1);
        // });

        axios.get("/cards").then(res => {
            this.cards = res.data;
            this.$nextTick(() => {
                checkScroll();
            });
        });

        const checkScroll = () => {
            const userHasScrolledtoBottom = isScrolledToBottom();
            if (userHasScrolledtoBottom) {
                axios
                    .get(
                        `/getMoreImages/${this.cards[this.cards.length - 1].id}`
                    )
                    .then(res => {
                        this.cards.push(...res.data);
                        const lastCard = this.cards[this.cards.length - 1];
                        if (lastCard.id !== lastCard.smallest_id) {
                            this.$nextTick(() => {
                                checkScroll();
                            });
                        }
                    });
            } else {
                setTimeout(checkScroll, 500);
            }
        };

        setInterval(() => {
            this.currentPageName =
                (this.currentPageName + 1) % this.pageNames.length;
        }, 1000);
    }
});

//when the user put something that doesn't exist in the database, close the modal//

function isScrolledToBottom() {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = document.documentElement.clientHeight;
    const windowScrollTop = document.documentElement.scrollTop;
    if (documentHeight === windowHeight + windowScrollTop) {
        return true;
    } else {
        return false;
    }
}
