Vue.component("image-modal", {
    props: ["imageId"],
    template: `<div class="image-modal-container">
        <div class="image-modal">
        <div v-on:click="close" class="image-modal-close">&times;</div>
        <img class="image-modal-image" v-bind:src="image.url"/>
        <div class="image-modal-title">{{image.title}}</div>
        <div class="image-modal-description">{{image.description}}</div>
        <div class="image-modal-username-date"><b>{{image.username}}</b> {{image.created_at}}</div>
        <div class="add-comment">Add a comment!</div>
        <form v-on:submit="addComment" class="addComment">
            <input v-model="comment" class="addComment-comment" type="text" placeholder="comment" required/>
            <input v-model="username" class="addComment-username" type="text" placeholder="username" required/>
            <button class="addComment-submit" type="submit">submit</button>
        </form>
            <div v-for="c in comments" class="comment">
                <div>{{c.comment}}!</div>
                <div><b>{{c.username}}</b> {{c.created_at}}</div>
            </div>
        </div>
    </div>`,
    methods: {
        close: function() {
            document.body.style.overflow = "initial";
            this.$emit("close");
        },
        addComment: function(e) {
            e.preventDefault();
            axios
                .post("/addComment", {
                    imageId: this.imageId,
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
            comments: [],
            image: {}
        };
    },

    mounted: function() {
        document.body.style.overflow = "hidden";
        axios
            .get(`/cards/${this.imageId}`)
            .then(res => {
                this.image = res.data;
            })
            .catch(() => {
                this.close();
            });

        axios.get(`/seeComment/${this.imageId}`).then(res => {
            this.comments = res.data;
        });
    }
});

new Vue({
    el: "#main",
    data: {
        cards: [],
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
            "kartinka",
            "fotografije",
            "fotografía",
            "kuva",
            "fotografia",
            "immagine",
            "gambar",
            "foto",
            "slika"
        ],
        currentPageName: 0,
        modalImage: location.hash.slice(1) || 0
    },
    methods: {
        handleFileChange: function(e) {
            this.upload.file = e.target.files[0];
        },

        closeModal: function() {
            this.modalImage = null;
            location.hash = "";
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
        window.addEventListener("hashchange", () => {
            const imageId = location.hash.slice(1);
            if (imageId !== "") {
                this.modalImage = imageId;
            }
        });

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
