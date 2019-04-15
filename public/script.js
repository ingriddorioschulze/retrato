new Vue({
    el: "#main",
    data: {
        cards: [],
        upload: {},
        pageNames: ["retrato", "fotografia", "bild", "picture"],
        currentPageName: 0
    },
    methods: {
        handleFileChange: function(e) {
            this.upload.file = e.target.files[0];
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
                        url: response.data.url
                    });
                });
        }
    },
    mounted: function() {
        axios.get("/cards").then(response => {
            this.cards = response.data;
        });
        //todo clear interval//
        setInterval(() => {
            this.currentPageName =
                (this.currentPageName + 1) % this.pageNames.length;
        }, 1000);
    }
});
