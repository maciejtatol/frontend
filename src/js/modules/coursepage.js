this.mmooc=this.mmooc||{};


this.mmooc.coursePage = function() {

    return {

        listModulesAndShowProgressBar: function() {
            mmooc.api.getModulesForCurrentCourse(function(modules) {
                var progressHTML = mmooc.util.renderTemplateWithData("courseprogress", {title: mmooc.i18n.CourseProgressionTitle, modules: modules});
                document.getElementById('course_home_content').insertAdjacentHTML('beforebegin', progressHTML);

                var modulesHTML = mmooc.util.renderTemplateWithData("modules", {navname: mmooc.i18n.GoToModule, coursemodules: mmooc.i18n.ModulePlural, modules: modules});
                document.getElementById('course_home_content').insertAdjacentHTML('beforebegin', modulesHTML);
                
                mmooc.discussionTopics.printDiscussionUnreadCount(modules, "coursepage");
            });
        },
        hideCourseInvitationsForAllUsers: function() {
            
            var acceptanceTextToSearchFor = 'invitert til å delta';
            //If .ic-notification__message contains 'Invitert til å delta' så skjul nærmeste parent .ic-notification  
            $(".ic-notification__message.notification_message:contains('" + acceptanceTextToSearchFor + "')")
                .closest('.ic-notification.ic-notification--success')
                .hide();
            
            var acceptanceFlashTextToSearchFor = 'delta i dette kurset';
            
             $("ul#flash_message_holder li:contains('" + acceptanceFlashTextToSearchFor + "')")
                .hide();
        },
        replaceUpcomingInSidebar: function() {
            $("body.home .coming_up").replaceWith(
                "<div class='deadlines-container'>" +
                "<h2>" + mmooc.i18n.eventsAndDeadlinesTitle + "</h2>" +
                "<div class='deadlines-scroll-up'></div>" +
                "<div class='deadlines-list'></div>" +
                "<div class='deadlines-scroll-down'></div>" +
                "</div>"
            );
        },
        printDeadlinesForCourse: function() {
            var courseId = mmooc.api.getCurrentCourseId();
            var allDeadlines = [];
            var params = { all_events: 1, type: "event", "context_codes": ["course_" + courseId] };
            mmooc.api.getCaledarEvents(params, function(events) {
                for (var i = 0; i < events.length; i++) {
                    if (events[i].end_at) {
                        var date = new Date(events[i].end_at);
                        var deadlineObj = {
                            date: date,
                            title: events[i].title
                        };
                        allDeadlines.push(deadlineObj);
                    }
                }
                var params = { all_events: 1, type: "assignment", "context_codes": ["course_" + courseId] };
                mmooc.api.getCaledarEvents(params, function(assignments) {
                    for (var i = 0; i < assignments.length; i++) {
                        if(assignments[i].all_day_date) {
                            var date = new Date(assignments[i].all_day_date);
                            var deadlineObj = {
                                date: date,
                                title: assignments[i].title,
                                url: assignments[i].html_url
                            };
                            allDeadlines.push(deadlineObj);
                        }
                    }
                    allDeadlines.sort(function(a,b){
                        return a.date - b.date;
                    });
                    var weekday = [];
                    var month = [];
                    var html = "<table>";
                    for (var i = 0; i < allDeadlines.length; i++) {
                        var monthName = mmooc.util.getMonthShortName(allDeadlines[i].date);
                        if ("url" in allDeadlines[i]) {
                            html += "<tr id='deadline-" + i + "'><div></div><td class='deadline-date'>" + allDeadlines[i].date.getDate() + ". " + monthName + "</td><td class='deadline-title'><a href='" + allDeadlines[i].url + "' title='" + allDeadlines[i].title + "'>" + allDeadlines[i].title + "</a></td></tr>";
                        }
                        else {
                            html += "<tr id='deadline-" + i + "'><td class='deadline-date'>" + allDeadlines[i].date.getDate() + ". " + monthName + "</td><td class='deadline-title'>" + allDeadlines[i].title + "</td></tr>";
                        }
                    }
                    html += "</table>";
                    $("body.home .deadlines-list").html(html);
                    var upcoming = mmooc.coursePage.findUpcomingDate(allDeadlines);
                    $("#deadline-" + upcoming).addClass("upcoming");
                    var parent = $("body.home .deadlines-list");
                    var row = $("#deadline-" + upcoming);
                    parent.scrollTop(parent.scrollTop() + (row.position().top - parent.position().top) - (parent.height()/2) + (row.height()/2));
                    $(".deadlines-scroll-up").click(function() {
                        var scroll = parent.scrollTop() - 50;
                        $(parent).animate({
                            scrollTop: scroll
                        }, 200);
                    });
                    $(".deadlines-scroll-down").click(function() {
                        var scroll = parent.scrollTop() + 50;
                        $(parent).animate({
                            scrollTop: scroll
                        }, 200);
                    });
                });
            });
        },
        findUpcomingDate: function(dates) {
            var today = Date.now();
            var nearestDate, nearestDiff = Infinity;
            var noMoreDeadlines = true;
            for (var i = 0; i < dates.length; i++) {
                var diff = +dates[i].date - today;
                if (diff > 0  &&  diff < nearestDiff) {
                    nearestDiff = diff;
                    nearestDate = i;
                    noMoreDeadlines = false;
                }
            }
            if (noMoreDeadlines) {
                return dates.length - 1;
            }
            else {
                return nearestDate;
            }            
        }       
    };
}();
