    //This short section prior to our main function contains the re-written form 
    //of the bindAll function. This allows containers (i.e. view) to use this. to refer
    //to themselves and easily access the model throughout execution.
    _.originalBindAll = _.bindAll;
    _.bindAll = function (that) {
      var funcs = Array.prototype.slice.call(arguments, 1),
      validKeys = [], fn;
      if (funcs.length == 0) {
        for (var i in that) {
          fn = that[i];
          if (fn && typeof fn == "function" && (!fn.prototype || _.keys(fn.prototype).length == 0))
            validKeys.push(i);
        }
        _.originalBindAll.apply(_, [that].concat(validKeys));
      }
      else
        _.originalBindAll.apply(_, arguments);
    };

      //Generic code starting our view when document is ready http://api.jquery.com/ready/
      $(function(){
        //Backbone code - begin
        //
        // All Model Declarations (Article, Banner, FeaturedGroup)
        //
        var ArticleModel = Backbone.Model.extend({
          defaults : {
            id : '',
            headLine : '',
            snippet : '',
            fullStory : '',
            location : '',
            nsfw : '',
            category : '',
            relatedArticleIds : '',
            hasVideoPlaceholder : '',
            numberOfImages : ''
          }
        });

        // FeaturedGroup to contain subsets of articles
        // Subsets of articles include main, aside, opinion, travel
        // Containing model of a collection

        var FeaturedGroup = Backbone.Model.extend({
          url: "http://html5news.herokuapp.com/articles/featured/",

          initialize : function () {
            this.main = new ArticlesCollection();
            this.aside = new ArticlesCollection();
            this.opinion = new ArticlesCollection();
            this.travel = new ArticlesCollection();

            this.on( "change", this.fetchCollections, this );
          },

          fetchCollections : function(){
            this.main.reset ( this.get("main"));
            this.aside.reset ( this.get( "aside" ));
            this.opinion.reset ( this.get( "opinion" ));
            this.travel.reset ( this.get( "travel" ));
          }
        });

        // Contains subsets of articles
        // Includes main, aside
        var CategoryGroup = Backbone.Model.extend({

          initialize : function (options) {
            this.main = new ArticlesCollection();
            this.aside = new ArticlesCollection();

            this.url = options.urlVal;

            this.on( "change", this.fetchCollections, this );
          },

          fetchCollections : function(){
            this.main.reset ( this.get("main"));
            this.aside.reset ( this.get( "aside" ));
          }
        });

        //Simple models for Banner, Category
         var BannerModel = Backbone.Model.extend({
          defaults : {
            id   : '',
            message   : ''
          }
        });

         var CategoryModel = Backbone.Model.extend({
          defaults : {
            id : '',
            shortName : '',
            displayName : ''
          }
         });

//
//      The collections
//

        var ArticlesCollection = Backbone.Collection.extend({
          model : ArticleModel
        });

        var BannersCollection = Backbone.Collection.extend({
          model: BannerModel,
          url: 'http://html5news.herokuapp.com/banners'
        });

        var CategoryCollection = Backbone.Collection.extend({
          model: CategoryModel,
          url: 'http://html5news.herokuapp.com/articles/categories'
        });

//
// All of the views (Article, Banner, )
//

        //Article View has some specific code to make the output look as it is supposed too.
        //We use default templates so that this does not break if used with a different JSON set.
        var ArticleView = Backbone.View.extend({
          tagName: 'article',
          template: null,
          events: {
          },

          initialize : function(options) {
            _.bindAll(this);

            section = this.options.section;
            if (section == "#asideSection"){
                this.template = _.template('<p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%= snippet %> </p>');
                }
            else if ( section == "#mainSection") {
                if (this.model.get("hasVideoPlaceholder") == true){
                //console.log("true");
                this.template = _.template('<div class="vid"><p>[video]</p></div><p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%=snippet %> </p>');
                }
                else if (this.model.get("numberOfImages") == 1){
                  this.template = _.template('<p> <%= headLine %>  <div class=\"imagePlace\"><p>[photo]</p></div></p> <p><span class="artLocation"><%= location %></span> <%= snippet %> </p>');
                }
                else {
                  this.template = _.template('<p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%= snippet %> </p>');
                }
            }
            else if (section == "#opinion"){
                  if (this.model.get("numberOfImages") == 1) {
                  //This pulls the full story apart so we can insert an image between them. 
                  var fStr = this.model.get("fullStory");
                  var front = '';
                  var back = '';
                  var loc = fStr.indexOf("<br>");
                  if (loc == -1) {
                    this.template = _.template('<p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%= fullStory %></p>');
                  }
                  else {
                    front = fStr.substr(0, loc + 4);
                    back = fStr.substr(loc + 4, fStr.length);
                    var newStr = front + "<div class=\"imagePlace\"><p>[photo]</p></div>" + back;
                    loc = newStr.indexOf("Shares");
                    front = newStr.substr(0, loc);
                    back = newStr.substr(loc, newStr.length);
                    newStr = front + "<br><br>" + back;

                    var hStr = this.model.get("headLine");
                    loc = hStr.indexOf(":");
                    front = hStr.substr(0, loc);
                    back = hStr.substr(loc, hStr.length);
                    var newHeadStr = "<span class=\"artLocation\">" + front + "</span>" + back;

                    var temp = '<p>' + newHeadStr + '</p> <p> <span class="artLocation"><%= location %></span> ' + newStr + '</p>';
                    this.template = _.template(temp);
                  }
                  
                }
                else {
                  this.template = _.template('<p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%= fullStory %></p>');
                }
            }

            else if (section == "#travel") {
              if (this.model.get("numberOfImages") == 1){
                this.template = _.template('<p> <%= headLine %> </p> <div class="imagePlace"><p>[photo]</p></div> <p><span class="artLocation"><%= location %></span> <%=snippet %> </p>');
              }
              else if (this.model.get("numberOfImages") == 2){
                this.template = _.template('<p> <%= headLine %> </p> <div class="imagePlace"><p>[photo]</p></div><div class="imagePlace"><p>[photo]</p></div>');
              }

            }

            else if (section == "#categoryMainSection"){
              if (this.model.get("numberOfImages") == 1){
                this.template = _.template('<p> <%= headLine %> </p> <div class="imagePlace"><p>[photo]</p></div> <p> <%= fullStory %> </p>');
              }
              else if (this.model.get("numberOfImages") == 2){
                this.template = _.template('<p> <%= headLine %> </p> <div class="imagePlace"><p>[photo]</p></div> <div class="imagePlace"><p>[photo]</p></div><p> <%= fullStory %> </p>');
              }
              else {
                this.template = _.template('<p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%= fullStory %> </p>');
              }
            }

            else if (section == "#categoryAsideSection"){
              if (this.model.get("numberOfImages") == 1){
                this.template = _.template('<p> <%= headLine %> </p> <div class="imagePlace"><p>[photo]</p></div> <p><span class="artLocation"><%= location %></span> <%= fullStory %> </p>');
              }
              else if (this.model.get("numberOfImages") == 2){
                this.template = _.template('<p> <%= headLine %> </p> <div class="imagePlace"><p>[photo]</p></div> <div class="imagePlace"><p>[photo]</p></div> <p><span class="artLocation"><%= location %></span> <%= fullStory %> </p>');
              }
              else {
                this.template = _.template('<p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%= fullStory %> </p>');
              }
            }
          },

          render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
            return this;
          }
        });

        //This view inserts the appropriate text into the banner
        var BannerView = Backbone.View.extend({
          id : 'bannerText',
          tagName   : 'p',
          template   : null,
          events     : {
          },

          initialize : function(){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //Read more here: http://documentcloud.github.com/underscore/#bindAll
            _.bindAll(this);

            //later we will see complex template engines, but is the basic from underscore
            var id = this.model.get("id");
            var temp = '';
            if (id == 2) {
              temp = '<h3 id=bannerText' + id + ' style="text-align:center;"><%= message %></h3>';
            }
            else {
              temp = '<h3 id=bannerText' + id + ' style="text-align:center;"><%= message %></h3>';
            }
            this.template = _.template(temp);
          },
          render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
            return this;
          }
        });

        //This is called when a particular category is clicked
        var CategoryView = Backbone.View.extend({
          tagName   : 'li',
          template   : null,
          events     : {
          },

          bold : '',

          initialize : function(options){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //Read more here: http://documentcloud.github.com/underscore/#bindAll
            _.bindAll(this);

            //later we will see complex template engines, but is the basic from underscore
            var str = "#/category/" + this.model.get("id");
            bold = options.bold;
            if (bold == 1) {
              this.template = _.template('<a style="font-weight:bold;text-shadow:1px 0 #333333" href=' + str + '><%= displayName %></a></b>');
            }
            else {
              this.template = _.template('<a href=' + str + '><%= displayName %></a>');
            }
          },
          render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
            return this;
          },
        });

        //We define the collection, associate the map for every item in the list
        //and define the url that fetch will be using to load remote data
        //Main View for the list
        var BannerColView = Backbone.View.extend({
          id         : "banner-id",
          //because it is a list we define the tag as ul
          tagName     : "div",
          //className     : "banner",

          events : {
          },

          str : '',

          initialize : function(options){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //Read more here: http://documentcloud.github.com/underscore/#bindAll
            _.bindAll(this);
            this.collection.bind('add', this.addItemHandler);
            this.str = options.strVal;
          },

          load : function(){

            //here we do the AJAX Request to get our json file, also provide a success and error callbacks
            this.collection.fetch({
              add: true,
              success: this.loadCompleteHandler,
              error: this.errorHandler
            });

          },

          //we arrived here one time per item in our list, so if we received 4 items we
          //will arrive into this function 4 times
          addItemHandler : function(model){
            var myItemView = new BannerView({model:model});
            myItemView.render();
            $(this.str).append(myItemView.el);

          },

          loadCompleteHandler : function(){
            this.render();
          },

          errorHandler : function(){
            throw "Error loading JSON file";
          },

          render : function(){

            //we assign our element into the available dom element
            //$(this.str).append($(this.el));

            return this;
          }
        });

        // View for sets of articles (featured contains mean, aside, opinion, and travel)
        var ArticleGroupView = Backbone.View.extend({
          id         : "article-id",
          //because it is a list we define the tag as ul
          tagName     : "ul",
          className     : "article",

          events : {
          },

          str : '',

          initialize : function(options){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //Read more here: http://documentcloud.github.com/underscore/#bindAll
            _.bindAll(this);
            //this.collection.bind('add', this.addItemHandler);
            this.str = options.strVar;
          },

          load : function(){
            //here we do the AJAX Request to get our json file, also provide a success and error callbacks
            this.render();
          },

          loadCompleteHandler : function(){
            this.render();
          },

          errorHandler : function(){
            throw "Error loading JSON file";
          },

          render : function(){

            var aModel;
            for (var i=0; i < this.collection.length; i++) {
              aModel = this.collection.models[i];
              var myArticleView = new ArticleView({model:aModel, section: this.str});
              myArticleView.render();
              $(this.el).append(myArticleView.el);
            }

            //we assign our element into the available dom element
            $(this.str).append($(this.el));

            return this;
          }
        });

        var CategoryColView = Backbone.View.extend({
          id         : "category-id",
          //because it is a list we define the tag as ul
          tagName     : "ul",
          className     : "category",

          events : {
          },

          str : '',
          id : '',
          count : 0,

          initialize : function(options){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //Read more here: http://documentcloud.github.com/underscore/#bindAll
            _.bindAll(this);
            this.collection.bind('add', this.addItemHandler);
            this.str = options.strVal;
            this.id = options.catVal;
          },

          load : function(){

            //here we do the AJAX Request to get our json file, also provide a success and error callbacks
            this.collection.fetch({
              add: true,
              success: this.loadCompleteHandler,
              error: this.errorHandler
            });

          },

          //essentially hits for every model
          addItemHandler : function(model){
            //each model
            if (this.id == 0) {
              var myItemView = new CategoryView({model:model, bold: 0});
              myItemView.render();
              $(this.el).append(myItemView.el);
            }
            else {
              this.count = this.count + 1;
              console.log(this.count);
              if (this.count == this.id) {
                var myItemView = new CategoryView({model:model, bold: 1});
                myItemView.render();
                $(this.el).append(myItemView.el);
              }
              else {
                var myItemView = new CategoryView({model:model, bold: 0});
                myItemView.render();
                $(this.el).append(myItemView.el);
              }
            }
          },

          loadCompleteHandler : function(){
            this.render();
          },

          errorHandler : function(){
            throw "Error loading JSON file";
          },

          render : function(){

            //we assign our element into the available dom element
            $(this.str).append($(this.el));

            return this;
          }
        });

        //View for groups of categories. Will break down into specific CategoryViews
        var CategoryGroupView = Backbone.View.extend({
          id         : "categoryGroup-id",
          //because it is a list we define the tag as ul
          tagName     : "ul",
          className     : "categoryGroup",

          events : {
          },

          str : '',

          initialize : function(options){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //Read more here: http://documentcloud.github.com/underscore/#bindAll
            _.bindAll(this);
            //this.collection.bind('add', this.addItemHandler);
            this.str = options.strVar;
          },

          load : function(){
            //here we do the AJAX Request to get our json file, also provide a success and error callbacks
            this.render();

          },

          loadCompleteHandler : function(){
            this.render();
          },

          errorHandler : function(){
            throw "Error loading JSON file";
          },

          render : function(){

            var aModel;
            for (var i=0; i < this.collection.length; i++) {
              aModel = this.collection.models[i];
              var myArticleView = new ArticleView({model:aModel, section: this.str});
              myArticleView.render();
              $(this.el).append(myArticleView.el);
            }

            //we assign our element into the available dom element
            $(this.str).append($(this.el));

            return this;
          }
        });


        //Routing Section that displays the correct section tags based on the user's navigation
        var AppRouter = Backbone.Router.extend({
         routes: {
          "category/:id": "categoryRoute",
          "*actions": "defaultRoute"
         }
        });
        var app_router = new AppRouter;
        app_router.on('route:categoryRoute', function(id) {
        //needs to be <a href="#/category/id(the actual id)"
        $('#mainSection').hide();
        $('#asideSection').hide();
        $('#rightSection').hide();
        $('#banner').hide();
        $('#catNav').empty();
        $('#catNav').show();
        $('#categoryMainSection').empty();
        $('#categoryAsideSection').empty();
        $('#categoryMainSection').show();
        $('#categoryAsideSection').show();
        var aURL = "http://html5news.herokuapp.com/articles/category/" + id;
        var cg = new CategoryGroup({urlVal : aURL});
        cg.fetch(
         {success: function() {
          var cg1 = new CategoryGroupView({collection: cg.main, strVar: '#categoryMainSection'});
          cg1.load();
          var cg2 = new CategoryGroupView({collection: cg.aside, strVar: '#categoryAsideSection'});
          cg2.load();
         }}
        );
        var cCollection = new CategoryCollection();
        var ccv = new CategoryColView({collection: cCollection, strVal: '#catNav', catVal: id});
        ccv.load();
      });
      app_router.on('route:defaultRoute', function(actions) {
        //Default
        //Featured Group executable goes here
        $('#categoryMainSection').hide();
        $('#categoryAsideSection').hide();
        $('#catNav').empty();
        $('#mainSection').empty();
        $('#asideSection').empty();
        $('#opinion').empty();
        $('#travel').empty();
        $('#banner').show();
        $('#mainSection').show();
        $('#asideSection').show();
        $('#rightSection').show();
        //We create the instance of our collection:
        var ag = new FeaturedGroup();
        ag.fetch(
          {success: function() {
            var agv1 = new ArticleGroupView({collection: ag.main, strVar: '#mainSection'});
            agv1.load();
            var agv2 = new ArticleGroupView({collection: ag.aside, strVar: '#asideSection'});
            agv2.load();
            var agv3 = new ArticleGroupView({collection: ag.opinion, strVar: '#opinion'});
            agv3.load();
            var agv4 = new ArticleGroupView({collection: ag.travel, strVar: '#travel'});
            agv4.load();
          }}
        );

        var bCollection = new BannersCollection();
        var bcv = new BannerColView({collection: bCollection, strVal: '#banner'});
        bcv.load();
        var cCollection = new CategoryCollection();
        var ccv = new CategoryColView({collection: cCollection, strVal: '#catNav', catVal: 0});
        ccv.load();
      });
      Backbone.history.start();
      
      })