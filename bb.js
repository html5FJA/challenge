
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

      
      //Move the these where execuatable is now
      

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
//
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


        var ArticleView = Backbone.View.extend({
          tagName: 'article',
          template: null,
          events: {
          },

          initialize : function() {
            _.bindAll(this);

          if (this.model.get("hasVideoPlaceholder") == true){
            console.log("true");
            this.template = _.template('<div class="vid"><p>[ video ]</p></div><p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%=snippet %> </p>');
            }
          else if (this.model.get("numberOfImages") == 1){
            this.template = _.template('<div class="imagePlace"><p>[ photo ]</p></div><p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%=snippet %> </p>');
          }
          else if (this.model.get("numberOfImages") == 2){
            this.template = _.template('<div class="imagePlace"><p>[ photo ]</p></div><div class="imagePlace"><p>[ photo ]</p></div><p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%=snippet %> </p>');
          }
          else{
            this.template = _.template('<p> <%= headLine %> </p> <p><span class="artLocation"><%= location %></span> <%= snippet %> </p>');
             }
          },

          render : function(){
            $(this.el).html( this.template( this.model.toJSON() ) );
            return this;
          }
        });

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

        var CategoryView = Backbone.View.extend({
          tagName   : 'li',
          template   : null,
          events     : {
          },

          initialize : function(options){
            //This is useful to bind(or delegate) the this keyword inside all the function objects to the view
            //Read more here: http://documentcloud.github.com/underscore/#bindAll
            _.bindAll(this);

            //later we will see complex template engines, but is the basic from underscore
            var str = "#/category/" + this.model.get("id");
            this.template = _.template('<a href=' + str + '><%= displayName %></a>');
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

        // ARTICLE VIEW
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
              var myArticleView = new ArticleView({model:aModel});
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

          //essentially hits for every model
          addItemHandler : function(model){
            //each model
            var myItemView = new CategoryView({model:model});
            myItemView.render();
            $(this.el).append(myItemView.el);
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
              var myArticleView = new ArticleView({model:aModel});
              myArticleView.render();
              $(this.el).append(myArticleView.el);
            }

            //we assign our element into the available dom element
            $(this.str).append($(this.el));

            return this;
          }
        });


//
// Executing code
//
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
      });
      app_router.on('route:defaultRoute', function(actions) {
        //Default
        //Featured Group executable goes here
        $('#categoryMainSection').hide();
        $('#categoryAsideSection').hide();
        $('#catNav').empty();
        $('#main').empty();
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
            //Put opinion and travel here.
          }}
        );

        var bCollection = new BannersCollection();
        var bcv = new BannerColView({collection: bCollection, strVal: '#banner'});
        bcv.load();
      });
      Backbone.history.start();
      var cCollection = new CategoryCollection();
      var ccv = new CategoryColView({collection: cCollection, strVal: '#catNav'});
      ccv.load();
        
      })