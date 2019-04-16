Vue.component("image-modal", {
    props: ["image"],
    template: `<div class="image-modal" >
        <div v-on:click="close" class="close">&times;</div>
        <img class="image-popup" v-bind:src="image.url"/>
        <div class="title">{{image.title}}</div>
        <div class="description">{{image.description}}</div>
        <div class="username-date">{{image.username}} at {{image.created_at}}</div>
        <div class="add-comment">Add a comment!</div>
        <form v-on:submit="addComment">
            <input v-model="comment" class="input-comment" type="text" placeholder="comment" required/>
            <input v-model="username" class="input-username" type="text" placeholder="username" required/>
            <button type="submit">submit</button>
        </form>
        <div v-for="c in comments" class="comment">
            <div>{{c.comment}}!</div>
            <div>{{c.username}} at {{c.created_at}}</div>
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
        upload: {},
        pageNames: ["retrato", "fotografia", "bild", "picture", "photo"],
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
                });
        }
    },
    mounted: function() {
        axios.get("/cards").then(res => {
            this.cards = res.data;
        });
        //todo clear interval//
        setInterval(() => {
            this.currentPageName =
                (this.currentPageName + 1) % this.pageNames.length;
        }, 1000);
    }
});
