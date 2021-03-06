this.mmooc = this.mmooc || {};

this.mmooc.menu = (function() {
  function _renderCourseMenu(course, selectedMenuItem, title, hideTabs) {
    function _insertCourseMenuHtml(course, selectedMenuItem, title, menuItems) {
      var subtitle = course.name;
      if (title == null) {
        title = course.name;
        subtitle = '';
      }
      var html = mmooc.util.renderTemplateWithData('coursemenu', {
        course: course,
        menuItems: menuItems,
        selectedMenuItem: selectedMenuItem,
        title: title,
        subtitle: subtitle
      });
      document.getElementById('header').insertAdjacentHTML('afterend', html);
    }

    var menuItems = [];

    var courseId = course.id;
    if (!hideTabs) {
      menuItems[menuItems.length] = {
        title: mmooc.i18n.Course + 'forside',
        url: '/courses/' + courseId
      };
      menuItems[menuItems.length] = {
        title: 'Kunngjøringer',
        url: '/courses/' + courseId + '/announcements'
      };
      menuItems[menuItems.length] = {
        title: 'Grupper',
        url: '/courses/' + courseId + '/groups'
      };
      menuItems[menuItems.length] = {
        title: 'Diskusjoner',
        url: '/courses/' + courseId + '/discussion_topics'
      };

      //SelectedMenuItem contains the path if we are called by the external path route.
      var tools = mmooc.util.getToolsInLeftMenu(selectedMenuItem);

      menuItems[menuItems.length] = {
        title: tools.activeToolName,
        toolList: tools.toolList,
        url: tools.activeToolPath
      };

      if (mmooc.util.isTeacherOrAdmin()) {
        menuItems[menuItems.length] = {
          title: 'Faglærer',
          url: '/courses/' + courseId + '/?mmpf'
        };
      }

      var badgeSafe = mmooc.menu.extractBadgesLinkFromPage();
      if (badgeSafe.url) {
        //If the url of Badges is found then display this as an additional tab
        menuItems[menuItems.length] = badgeSafe;
        _insertCourseMenuHtml(course, selectedMenuItem, title, menuItems);
      } else if (mmooc.settings.useCanvaBadge) {
        mmooc.menu.setCanvaBadgesLink(course, function(canvaBadgeObject) {
          //Second parameter is a callback function
          if (canvaBadgeObject.url) {
            menuItems[menuItems.length] = canvaBadgeObject; //check if canva badges is used for the current domain and if it is and the user has any badges then display this additional tab
          }
          _insertCourseMenuHtml(course, selectedMenuItem, title, menuItems);
        });
      } else {
        _insertCourseMenuHtml(course, selectedMenuItem, title, menuItems);
      }
      $('#mmooc-menu-item-verktoy').click(function(event) {
        handleMenuClick('#mmooc-menu-item-verktoy', '#mmooc-verktoy-list');
      });
    }
  }

  function createStyleSheet() {
    var style = document.createElement('style');

    // WebKit hack :(
    style.appendChild(document.createTextNode(''));

    document.head.appendChild(style);

    return style.sheet;
  }

  function insertCustomMenuElementInTopMenu(linkText, link) {
    var menu = document.getElementById('menu');
    if (menu) {
      menu.insertAdjacentHTML(
        'afterbegin',
        '<li class="menu-item custom-item ic-app-header__menu-list-item"><a href="' +
          link +
          '" class="menu-item-no-drop ic-app-header__menu-list-link">' +
          linkText +
          '</a></li>'
      );
    }
  }

  function openHelpDialog(event) {
    event.preventDefault();
    $('#global_nav_help_link').click(); //Do the same as when you are clicking on the original help button (which display the help dialog)
  }

  function hideHelpMenuElementIfNotActivated() {
    $canvasHelpButton = $('#global_nav_help_link');
    if ($canvasHelpButton.length == 0) {
      $('li.helpMenu').hide();
    }
  }
  function handleMenuClick(menuSelectId, menuId) {
    if ($(menuId).css('display') != 'none') {
      $(menuId).slideUp(400);
      $(menuSelectId).off('mouseleave');
    } else {
      $(menuId).slideDown(400);
      $(menuSelectId).mouseleave(function() {
        $(menuId).slideUp(400);
      });
    }
  }

  var stylesheet = createStyleSheet();

  return {
    listModuleItems: function() {
      mmooc.api.getCurrentModule(function(module) {
        var courseId = mmooc.api.getCurrentCourseId();
        var html = mmooc.util.renderTemplateWithData('moduleitems', {
          backToCoursePage: mmooc.i18n.BackToCoursePage,
          module: module,
          courseId: courseId
        });
        if (document.getElementById('left-side')) {
          document
            .getElementById('left-side')
            .insertAdjacentHTML('afterbegin', html);
        }
        $('.mmooc-reveal-trigger').click(function(event) {
          var $trigger = $(this);
          var body = $trigger.attr('href');
          var i = $trigger.find('i');

          //Hvis elementet vises så lukker vi det
          if ($(body).css('display') != 'none') {
            $(body).slideUp(400);
            //Hvis det inneholder det aktive elementet så må vi vise det.
            if ($trigger.attr('id') == 'mmooc-module-item-active-header') {
              $trigger.attr('class', 'active mmooc-reveal-trigger');
            }
            i.attr('class', 'icon-mini-arrow-right');
          } else {
            $(body).slideDown(400);
            if ($trigger.attr('id') == 'mmooc-module-item-active-header') {
              $trigger.attr('class', 'mmooc-reveal-trigger');
            }
            i.attr('class', 'icon-mini-arrow-down');
          }
          return false;
        });
      });
    },
    showLeftMenu: function() {
      stylesheet.insertRule(
        'body.with-left-side #main { margin-left: 305px !important }',
        stylesheet.cssRules.length
      );
      stylesheet.insertRule(
        '.with-left-side #left-side { display: block !important }',
        stylesheet.cssRules.length
      );
      $('body').addClass('useFullWidth'); //Used to solve problems in making the design 100% width in the new UI. This is the simplest way to implement this.
    },

    renderLeftHeaderMenu: function() {
      // render left header menu only for autheticated users
      if (mmooc.util.isAuthenticated()) {
        // The entire menu is rebuilt because of unwanted popup in the new ui menu
        insertCustomMenuElementInTopMenu('Kalender', '/calendar');
        if (mmooc.settings.removeGlobalGradesLink == false) {
          insertCustomMenuElementInTopMenu('Karakterer', '/grades');
        }
        if (mmooc.settings.removeGroupsLink == false) {
          insertCustomMenuElementInTopMenu('Grupper', '/groups');
        }
        insertCustomMenuElementInTopMenu(mmooc.i18n.CoursePlural, '/courses');

        if (mmooc.util.isTeacherOrAdmin()) {
          this.showLeftMenu();

          $('#section-tabs-header').show();

          //Canvas changed the aria-label as shown in the two lines below. Keep both lines for backward compatibility.
          $("nav[aria-label='context']").show();
          $("nav[aria-label='Emner-navigasjonsmeny']").show();

          //20180821ETH Venstremenyen heter noe annet for grupper.
          //20180906ETH Men vi ønsker ikke vise den.
          //                $("nav[aria-label='Navigasjonsmeny for grupper ']").show();

          $('#edit_discussions_settings').show();
          $('#availability_options').show();
          $('#group_category_options').show();
          $('#editor_tabs').show();

          // Done via CSS since content is loaded using AJAX
          stylesheet.insertRule(
            'body.pages .header-bar-outer-container { display: block }',
            stylesheet.cssRules.length
          );
          stylesheet.insertRule(
            '#discussion-managebar { display: block }',
            stylesheet.cssRules.length
          );
        }
      }

      var roles = mmooc.api.getRoles();
      if (roles != null && roles.indexOf('admin') != -1) {
        // Admin needs original canvas Course dropdown to access site admin settings
        //$("#courses_menu_item").show(); //Applies only for Old UI. This is the course menu item with a sub menu.
        insertCustomMenuElementInTopMenu('Admin', '/accounts');
        // Admin needs more profile settings
        $('.add_access_token_link').show();
        $('body.profile_settings')
          .find('#content > table, #content > h2, #content > p')
          .show();
      }
    },

    renderUnauthenticatedMenu: function() {
      if (!mmooc.util.isAuthenticated()) {
        let html = mmooc.util.renderTemplateWithData('noLoggedInHeader', {
          logInText: mmooc.i18n.LogIn
        });
        $('#header').html(html);
        mmooc.login.handleLoginButtonClick();
      }
    },

    hideRightMenu: function() {
      $('#right-side').hide();
      $('body').removeClass('with-right-side');
    },

    hideSectionTabsHeader: function() {
      $('#section-tabs-header-subtitle').hide();
    },

    showUserMenu: function() {
      var menu = document.getElementById('menu');
      if (menu != null && mmooc.util.isAuthenticated()) {
        var html = mmooc.util.renderTemplateWithData('usermenu', {
          user: mmooc.api.getUser()
        });
        menu.insertAdjacentHTML('afterend', html);

        $('#mmooc-menu-item-varsler').click(function(event) {
          handleMenuClick('#mmooc-menu-item-varsler', '#mmooc-activity-stream');
        });
        $('#mmooc-menu-item-profile-settings').click(function(event) {
          handleMenuClick(
            '#mmooc-menu-item-profile-settings',
            '#mmooc-profile-settings'
          );
        });
        mmooc.api.getUnreadMessageSize(function(conversations) {
          var msgBadge = $('#mmooc-unread-messages-count');
          if (conversations.unread_count != '0') {
            msgBadge.html(conversations.unread_count);
            msgBadge.show();
          } else {
            msgBadge.hide();
          }
        });
        this.updateNotificationsForUser();

        //20180921ETH Vi bruker ikke hjelpemenyen lenger.
        //                $(document).on("click", ".helpMenu", openHelpDialog);
        //                hideHelpMenuElementIfNotActivated();
      }
    },

    setMenuActiveLink: function() {
      var menuItems = $('.ic-app-header__menu-list li a ');
      menuItems.each((_, element) => {
        if (window.location.pathname.includes($(element).attr('href'))) {
          $(element).addClass('active');
        }
      });
    },

    updateNotificationsForUser: function() {
      mmooc.api.getActivityStreamForUser(function(activities) {
        var unreadNotifications = 0;
        for (var i = 0; i < activities.length; i++) {
          if (mmooc.menu.checkReadStateFor(activities[i])) {
            unreadNotifications++;
          }
          activities[i].created_at = mmooc.util.formattedDate(
            activities[i].created_at
          );
        }

        var badge = $('#mmooc-notification-count');
        if (unreadNotifications == 0) {
          badge.hide();
        } else {
          badge.html(unreadNotifications);
          badge.show();
        }

        document.getElementById(
          'mmooc-activity-stream'
        ).innerHTML = mmooc.util.renderTemplateWithData('activitystream', {
          activities: activities
        });

        var notifications = $('#mmooc-notifications').find('li');
        var showAllItems = $('#mmooc-notifications-showall');
        if (notifications.size() > 10) {
          notifications.slice(10).addClass('hidden');

          showAllItems.click(function() {
            notifications.removeClass('hidden');
            showAllItems.hide();
          });
        } else {
          showAllItems.hide();
        }
      });
    },

    showCourseMenu: function(courseId, selectedMenuItem, title, hideTabs) {
      hideTabs = hideTabs || false; //Do not hide tabs if the parameter
      $('body').addClass('with-course-menu');
      mmooc.api.getCourse(courseId, function(course) {
        _renderCourseMenu(course, selectedMenuItem, title, hideTabs);
      });
    },

    showBackButton: function(url, title) {
      var buttonHTML = mmooc.util.renderTemplateWithData('backbutton', {
        url: url,
        title: title
      });
      document
        .getElementById('content-wrapper')
        .insertAdjacentHTML('afterbegin', buttonHTML);
    },

    showGroupHeader: function() {
      var groupId = mmooc.api.getCurrentGroupId();
      var groupHeaderHTML = mmooc.util.renderTemplateWithData('backbutton', {
        groupId: groupId
      });
      document
        .getElementById('content-wrapper')
        .insertAdjacentHTML('afterbegin', groupHeaderHTML);
    },

    showDiscussionGroupMenu: function() {
      function strLeft(sourceStr, keyStr) {
        return (sourceStr.indexOf(keyStr) == -1) | (keyStr == '')
          ? ''
          : sourceStr.split(keyStr)[0];
      }

      function _addGetHelpFromteacherButton(group) {
        //Match gruppenavn mot seksjon i seksjonsliste.
        function _getSectionRecipientFromGroupName(
          sectionRecipients,
          groupName
        ) {
          for (var i = 0; i < sectionRecipients.length; i++) {
            var r = sectionRecipients[i];
            if (r.name == groupName) {
              return r.id;
            }
          }
          return null;
        }

        function _tilkallVeilederFeilet() {
          $('#mmooc-get-teachers-help').addClass('btn-failure');
          $('#mmooc-get-teachers-help').html('Tilkall veileder feilet');
        }

        function _sendMessageToSectionTeachers() {
          var courseId = mmooc.api.getCurrentCourseId();
          mmooc.api.getUserGroupsForCourse(courseId, function(groups) {
            if (groups.length == 0 || groups.length > 1) {
              _tilkallVeilederFeilet();
              alert(
                'Det er noe galt med gruppeoppsettet ditt.\nDu er medlem i ' +
                  groups.length +
                  ' grupper.'
              );
            } else {
              var group = groups[0];
              var groupName = group.name;
              var groupCourseId = group.course_id;
              mmooc.api.getSectionRecipients(
                groupCourseId,
                (function(courseId) {
                  return function(recipients) {
                    var sectionRecipient = _getSectionRecipientFromGroupName(
                      recipients,
                      groupName
                    );
                    if (sectionRecipient == null) {
                      _tilkallVeilederFeilet();
                      alert(
                        'Det er noe galt med gruppeoppsettet ditt.\nFant ikke seksjonen til ' +
                          groupName
                      );
                    } else {
                      var sectionRecipientTeachers =
                        sectionRecipient + '_teachers';
                      var subject =
                        groupName + ' ' + mmooc.i18n.GroupGetInTouchSubject;
                      var discussionUrl = window.location.href;
                      var discussionAndGroupTitle = $(
                        '.discussion-title'
                      ).text();
                      var discussionTitle = strLeft(
                        discussionAndGroupTitle,
                        ' - '
                      );
                      var newLine = '\n';

                      var body =
                        mmooc.i18n.WeHaveAQuestionToTeacherInTheDiscussion +
                        ' "' +
                        discussionTitle +
                        '":' +
                        newLine +
                        discussionUrl;

                      $('#mmooc-get-teachers-help').html('Sender melding...');

                      mmooc.api.postMessageToConversation(
                        courseId,
                        sectionRecipientTeachers,
                        subject,
                        body,
                        function(result) {
                          console.log(result);
                          $('#mmooc-get-teachers-help').addClass('btn-done');
                          $('#mmooc-get-teachers-help').html(
                            'Veileder tilkalt'
                          );
                        },
                        function(error) {
                          _tilkallVeilederFeilet();
                          alert(
                            'Tilkall veileder feilet. Gruppen har ingen veileder.'
                          );
                          console.log(error);
                        }
                      );
                    }
                  };
                })(groupCourseId)
              );
            }
          });
        }

        function _addClickEventOnGetHelpFromTeacherButton() {
          $('#mmooc-get-teachers-help').click(function() {
            $('#mmooc-get-teachers-help').off('click');
            $('#mmooc-get-teachers-help').html('Finner veileder...');
            _sendMessageToSectionTeachers();
          });
        }

        // Get help from teacher by clicking a button
        var getHelpButtonFromteacherButtonHTML = mmooc.util.renderTemplateWithData(
          'groupdiscussionGetHelpFromTeacher',
          { hoverOverText: mmooc.i18n.CallForInstructorHoverOverText }
        );
        //document.getElementById('content').insertAdjacentHTML('afterbegin', getHelpButtonFromteacherButtonHTML);
        $('#discussion-managebar > div > div > div.pull-right').append(
          getHelpButtonFromteacherButtonHTML
        );
        _addClickEventOnGetHelpFromTeacherButton();
      }

      var groupId = mmooc.api.getCurrentGroupId();
      if (groupId != null) {
        mmooc.api.getGroup(groupId, function(group) {
          // For discussion pages we only want the title to be "<discussion>" instead of "Discussion: <discussion>"
          var title = mmooc.util.getPageTitleAfterColon();
          mmooc.menu.showCourseMenu(group.course_id, 'Grupper', title, true); //Group menu in tabs including title - Use optional fourth parameter for hiding tabs
          _addGetHelpFromteacherButton(group);
        });
      }
    },

    checkReadStateFor: function(activity) {
      return activity.read_state === false;
    },

    extractBadgesLinkFromPage: function() {
      var href = $('li.section:contains("BadgeSafe")')
        .find('a')
        .attr('href');
      return { title: mmooc.i18n.Badgesafe, url: href };
    },
    setCanvaBadgesLink: function(course, callback) {
      var user_id = mmooc.api.getUser().id;

      //This should be refactored to be in an api resource file
      var domain = location.host;
      var urlToCanvaBadgesApi =
        mmooc.settings.CanvaBadgeProtocolAndHost +
        '/api/v1/badges/public/' +
        user_id +
        '/' +
        encodeURIComponent(domain) +
        '.json';
      $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: urlToCanvaBadgesApi,
        timeout: 5000,
        success: function(data) {
          if ($.isFunction(callback)) {
            callback({
              title: mmooc.i18n.Badgesafe,
              url: '/courses/' + course.id + '?allcanvabadges'
            });
          }

          // if(data.objects && data.objects.length > 0) {

          // }
        },
        error: function(err) {
          if ($.isFunction(callback)) {
            callback({
              title: mmooc.i18n.Badgesafe,
              url: undefined
            });
          }
        }
      });
    },

    injectGroupsPage: function() {
      $('#courses_menu_item').after(
        '<li class="menu-item"><a href="/groups" class="menu-item-no-drop">Grupper</a></li>'
      );
    },

    alterHomeLink: function() {
      $('#header-logo').attr('href', '/courses');
      $('a.ic-app-header__logomark').attr('href', '/courses'); //New UI
      $('a.ic-app-header__logomark').attr('src', '../../bitmaps/logo.svg'); //New UI
      $('.ic-app-header__logomark-container')
        .detach()
        .prependTo('.ic-app-header__main-navigation');
    },

    alterCourseLink: function() {
      //   if ($('#menu > li:first-child a').hasClass('menu-item-no-drop')) {
      //     $('#menu > li:first-child a').attr('href', '/courses');
      //   }
    }
  };
})();
