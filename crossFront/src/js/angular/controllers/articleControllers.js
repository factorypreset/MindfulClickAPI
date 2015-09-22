angular.module('cross')
.controller('ArticleCtrl',['$scope','$http','Article','Meta',function ($scope,$http,Article,Meta) {
  $scope.csrftoken = $.cookie('csrftoken');
  $scope.articles = Article.query();
  $scope.taggedArticles = Article.queryTagged();

  Meta.query(function (value, response) {
    $scope.companies = value[0].company;
    $scope.categories = value[1].ethicssubcategory;
  });

  $scope.deleteModal = 'templates/includes/delete_modal.html';

  $scope.removeFromList = function (item, list) {
    var index = 0;
      list.some(function(elem, i) {
        if (elem.id === item.id) {
          index = i;
          return true;
        }
      });
      list.splice(index,1);
  };
}]);



angular.module('cross')
.controller('SingleArticleCtrl',['$scope', 'Article',function ($scope, Article) {

  $scope.tagForm = 'templates/includes/tag_form.html';
  $scope.articleTemplate = 'templates/includes/article_base.html';
  $scope.state = {addTag:false};
  $scope.error = {
    error: false,
    msg: ""
  };
  $scope.cancel = true;

  $scope.articleSubmit = function () {
    $scope.tempArticle.csrfmiddlewaretoken = $scope.csrftoken;

    Article.update({articleID: $scope.article.id},$scope.tempArticle,function () {
      $scope.articleTemplate = 'templates/includes/article_base.html';
      $scope.article = $.extend({},$scope.tempArticle);
    },function (response) {
      $scope.error.msg = JSON.stringify(response.data);
      $scope.error.error = true;
    });
  };

  $scope.readyForm = function() {
    $scope.tempArticle = $.extend({},$scope.article);
    $scope.articleTemplate = 'templates/includes/article_form.html';
  };

  $scope.flipBack = function () {
    $scope.articleTemplate='templates/includes/article_base.html';
  }; 

  $scope.tagCancel = function () {
    $scope.state.addTag = false;
  };

}]);

angular.module('cross')
.controller('NewArticleCtrl',['$scope','Article',function ($scope, Article) {
  $scope.articleForm = 'templates/includes/article_form.html';
  $scope.error = {error: false,
                  msg: ""};
  $scope.success = {success: false,
                    msg: "Your article has been sucessfully submitted"};

  $scope.tempArticle = {
    id: 0,
    url: "",
    title: "",
    notes: ""
  };

  $scope.articleSubmit = function () {
    $scope.tempArticle.csrfmiddlewaretoken = $scope.csrftoken;

    Article.save({articleID:'new'},$scope.tempArticle,function (value, response) {
      $scope.articles.push(value);
      $scope.tempArticle = {
        id: 0,
        url: "",
        title: "",
        notes: ""
      };
      $scope.error.error = false;
      $scope.success.success = true;
    },function (response) {
      $scope.error.msg = JSON.stringify(response.data);
      $scope.error.error = true;
      $scope.success.success = false;
    });
  };


}]);

angular.module('cross')
.controller('ArticleDeleteCtrl',['$scope','Article',function ($scope,Article) {
  $scope.modalContent = {
    id: 'modal-article-' + $scope.article.id,
    label: 'modalLabel-article-' + $scope.article.id,
    kind: 'Article',
    title: $scope.article.title,
    msg: 'This will not only remove the article, but any associated tags as well.  This cannot be undone'
  };

  $scope.itemDelete = function () {
    $scope.article.csrfmiddlewaretoken = $scope.csrftoken;

    Article.delete({articleID: $scope.article.id},function () {
      if ($scope.articles.some(function (element, index, array) { return element.id === $scope.article.id; })) {
        $scope.removeFromList($scope.article,$scope.articles);
      } else {
        $scope.removeFromList($scope.article,$scope.crossList);
      }
      

      $('myModal' + $scope.article.id).modal('toggle');
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
    });
  };
}]);

angular.module('cross')
.controller('SingleTagCtrl',['$scope','Tag',function ($scope,Tag) {
  $scope.buttons = false;
  $scope.tagUrl = 'templates/includes/tag_base.html';

  $scope.tagEdit = function () {
    
    $scope.tagUrl = 'templates/includes/tag_form.html';
    $scope.newTag = $.extend({},$scope.tag);
    $scope.newTag.company = $.grep($scope.companies,function(v) {return v.name === $scope.newTag.company;})[0].id;
    var category = $.grep($scope.categories,function(v) {return v.name === $scope.newTag.tag_type.subcategory;})[0];
    $scope.newTag.subcategory = category.id;
    $scope.tagTypes = category.tag_types;
    $scope.newTag.tag_type = $scope.tag.tag_type.id;
  };

  $scope.tagCancel = function () {
    
    $scope.tagUrl = 'templates/includes/tag_base.html';

  };

  $scope.tagSubmit = function () {
    $scope.newTag.article = $scope.article.id;

    Tag.update({tagID:$scope.tag.id},$scope.newTag,function (value, response) {

      // Replace element IDs with actual names
      value.company = $.grep($scope.companies,function(v) {return v.id === value.company;})[0].name;
      var category = $.grep($scope.categories,function(v) {return v.id === $scope.newTag.subcategory;})[0];

      value.tag_type = {
        name: $.grep(category.tag_types, function(v) {return v.id === value.tag_type;})[0].name,
        subcategory: category.name,
        id: value.tag_type
      };

      $scope.tag = $.extend({},value);
      $scope.error.error = false;

      $scope.tagUrl = 'templates/includes/tag_base.html';

    }, function (response) {
      $scope.error.msg = JSON.stringify(response.data);
      $scope.error.error = true;
    });
  };

}]);

angular.module('cross')
.controller('NewTagCtrl',['$scope','Tag',function ($scope,Tag) {
  $scope.newTag = {
    company: "",
    subcategory: "",
    tag_type: "",
    excerpt: "",
    article: $scope.article.id
  };

  $scope.tagSubmit = function () {
    $scope.newTag.csrfmiddlewaretoken = $scope.csrftoken;

    Tag.save({tagID: 'new'},$scope.newTag,function (value,response) {
      $scope.article.tags = $scope.article.tags || [];

      // Replace element IDs with actual names
      value.company = $.grep($scope.companies,function(v) {return v.id === value.company;})[0].name;
      var category = $.grep($scope.categories,function(v) {return v.id === $scope.newTag.subcategory;})[0];

      value.tag_type = {
        name: $.grep(category.tag_types, function(v) {return v.id === value.tag_type;})[0].name,
        subcategory: category.name,
        id: value.tag_type
      };

      $scope.article.tags.push(value);
      $scope.state.addTag = false;
      $scope.error.error = false;

      //if the article is in the Unanalyzed list, move it to the analyzed list
      if($scope.article.tags.length === 1) {
        $scope.taggedArticles.push($scope.article);
        $scope.removeFromList($scope.article,$scope.articles);
      }
    },function (response) {
      $scope.error.msg = JSON.stringify(response.data);
      $scope.error.error = true;
    });   
  };

  

}]);

angular.module('cross')
.controller('TagFormCtrl',['$scope','TagType',function ($scope,TagType) {
  $scope.tagFormState = {
    addTagType: false
  };

  $scope.newTagType = {
    name: ''
  };

  // Shows the form to add new Tag Type
  $scope.showNewTagType = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.tagFormState.addTagType = !$scope.tagFormState.addTagType;
  };

  // Submit a New Tag Type
  $scope.submitTagType = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();

    // Get the currently selected subcategory
    $scope.newTagType.subcategory = $scope.newTag.subcategory;

    console.log($scope.newTagType);

    // Send the new TagType to server
    TagType.save($scope.newTagType,function (value, respone) {
      console.log(value);

      // Get index of current subcategory
      var index = 0;
      $scope.categories.some(function(elem, i) {
        if (elem.id === $scope.newTag.subcategory) {
          index = i;
          return true;
        }
      });

      // Add the new Tag Type to the current category list
      $scope.categories[index].tag_types.push(value);

      // Set the form to the new TagTpe
      $scope.newTag.tag_type = value.id;

      // Reset the add Tag Type form to invisible
      $scope.tagFormState.addTagType = false;
    },function (response) {
      console.log(response.data);
      $scope.error.msg = JSON.stringify(response.data);
      $scope.error.error = true;
    });
  };

  // Switches to the appropriate set of TagTypes when an ethical category is selected
  $scope.loadFacts = function () {
    $scope.tagTypes = $.grep($scope.categories,function(v) {return v.id === $scope.newTag.subcategory;})[0].tag_types;
  };

}]);

angular.module('cross')
.controller('DeleteTagCtrl',['$scope','Tag',function ($scope,Tag) {
  $scope.modalContent = {
    id: 'modal-cross-' + $scope.article.id + '-' + $scope.tag.id,
    label: 'modalLabel-cross-' + $scope.article.id + '-' + $scope.tag.id,
    kind: 'Tag',
    title: $scope.tag.tag_type.name + " on " + $scope.article.title,
    msg: 'This cannot be undone'
  };

  $scope.itemDelete = function () {

    Tag.delete({tagID:$scope.tag.id}, function (value,response) {
      $scope.removeFromList($scope.tag,$scope.article.tags);
      if ($scope.article.tags.length === 0) {
        $scope.removeFromList($scope.article,$scope.taggedArticles);
        $scope.articles.push($scope.article);
      }

      $('myModal' + $scope.article.id).modal('toggle');
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
    });
  };
}]);