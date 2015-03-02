var ws = new cloudmine.WebService({
				appid: "7dbd6010969c4234af24be6f31cee847",
				apikey: "26bdff40326740fd9323621d17cad02d" });

var isValidNumber = function(number){
	return !isNaN(parseFloat(number)) && isFinite(number);
};

var salarycap = function(sport){
	switch(sport){
		case "NHL":
			return 69000000;
			break;
		case "NBA":
			return 63065000;
			break;
		case "MLB":
			return 178000000;
			break;
		case "MLS":
			return 3100000;
			break;
		case "NFL":
			return 143000000;
			break;
	}
};

var positionsList = function(sport){
	var positions = [];
	switch(sport){
		case "NHL":
			positions = ["Center", "Left Wing", "Right Wing", "Defense", "Goalie"];
			break;
		case "MLB":
			positions = ["Pitcher", "Catcher", "1st Base", "2nd Base", "3rd Base", "Shortstop", "Left Field", "Center Field", "Right Field"];
			break;
		case "NBA":
			positions = ["Center", "Power Forward", "Small Forward", "Shooting Guard", "Point Guard"];
			break;
		case "MLS":
			positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
			break;
		case "NFL":
			positions = ["Quarterback", "Halfback", "Fullback", "Wide Receiver", "Tight End", "Offensive Lineman", "Defensive Lineman"
				, "Linebacker", "Cornerback", "Safety", "Kicker", "Punter"];
			break;
	}

	var positionString = "";

	for(var position in positions){
		positionString += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">' + positions[position] + '</a></li> \ ';
	}
	return positionString;
}

var addNewTeam = function(nameString, sport) {
	var cap = salarycap(sport);

	ws.set(null, {name: nameString, salarycap:"0", capspace:cap, type:"Team", sport:sport}).on("success", function(data, response) {
	  console.log(data);
	  $("#new-team-button").popover("hide");
	  location.reload();
	});
};

var deleteTeam = function(teamId, thisobj){
	ws.destroy(teamId).on('success', function(data, response){
		thisobj.parent().parent().remove();
		if($('#team-table tr').length < 2){
			$('#team-table > tbody:last').append("<tr><td>No Data To Display. Add a new player to get started.</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");
		}

		ws.destroy(null, { query: '[type = "Player", team = "' + teamId +'"]' }).on('success', function(data, response) {
		  console.log(data);
		});			
	});
};

var editTeamName = function(teamId, newName){
	ws.update(teamId, { name: newName }).on('success', function(data,response){
		location.reload();
	});
};

var populateTeamTable = function(sport) {
	ws.search('[sport = "' + sport + '", type = "Team"]', {sort: 'name' }).on('success', function(data, response) {
		if(data == undefined || data == [] || data == null || $.isEmptyObject(data)){
			$('#team-table > tbody:last').append("<tr><td>No Data To Display. Add a new team to get started.</td><td></td><td></td></tr>");
		}
		for (var id in data) {
		    var obj = data[id];

		    var options = { style: "currency", currency: "USD" };
			
			var nameRow = "<td data-id='" + id + "'>" 
				+ "<i id='" + id + "-edit' class='fa fa-pencil-square-o fa-lg' style='margin-right:3px;'></i>" 
				+ "<i id='" + id + "-delete' class='fa fa-times fa-lg' style='margin-right:8px; color:red'></i>" 
				+ "<a id='" + id + "-name' data-id='" + id + "'>" + obj.name + "</a>" 
			+ "</td>";
			var capSpaceRow = "<td>" + Number(obj.capspace).toLocaleString("en-US",options) + "</td>";
			var salaryCapRow = "<td>" + Number(obj.salarycap).toLocaleString("en-US",options) + "</td>";
			
			var html = ["<tr>", nameRow, salaryCapRow, capSpaceRow, "</tr>" ].join("");
			
			$('#team-table > tbody:last').append(html);
			
			var temp = id;
			
			$('#' + id + '-name').on("click", function(){
				sessionStorage.setItem("selectedTeam", $(this).attr("data-id"));
				window.location.href = sport + "Team.html";
			});
			
			$('#' + id + '-edit').popover({
				placement: "right",
				trigger: "click",
				title: "Edit Team",
				content: '<div> \
						<div class="input-group"> \
							<span class="input-group-addon">Team Name</span> \
							<input id="name-input-field-' + id + '" type="text" class="form-control" placeholder="Enter Name Here" aria-describedby="basic-addon1"> \
						</div> \
						\
						<div class="btn-group" role="group" aria-label="..." style="margin-top:10px"> \
							<button type="button" id="cancel-button-'+ id + '" class="btn btn-default">Cancel</button> \
							<button type="button" id="edit-team-submit-'+ id + '" class="btn btn-default">Submit</button> \
						</div> \
						\
						<div id="warning-field-' + id +'"> \
						</div>	\
					</div> \
					<script type="text/javascript">\
						$("#name-input-field-' + id + '").val($("[id=' + id + '-name]").text()); \
						$("#edit-team-submit-' + id + '").on("click", function(){ \
							if($("#name-input-field-' + id + '").val().length == 0){ \
								$("#warning-field-'+ id + '").append("<div style=margin-top:10px>You need to enter something.</div>"); \
							} \
							else { \
								editTeamName("' + id + '", $("#name-input-field-' + id + '").val()); \
							} \
						}); \
						\
						$("#cancel-button-' + id + '").on("click", function(){ \
							$("#'+ id +'-edit").popover("hide"); \
						}); \
					</script>',
				html: "true"
			});

			$('#' + id + '-delete').on("click", function(){
				var thisobj = $(this);
				if(BootstrapDialog.confirm('Are you sure you wish to delete this team?', function(result) {
					if(result){
						deleteTeam(thisobj.parent().attr('data-id'), thisobj);
					}
				}));
			});
		}
	});
};

var displayTeamHeader = function() {
	var id = sessionStorage.getItem("selectedTeam");
	ws.get(id).on('success', function(data, response){
		$('#team-header').text(data[id].name + " Salary Information");
	});
};

var addNewPlayer = function(nameString, positionString, cap1415Int, cap1516Int, cap1617Int, cap1718Int, cap1819Int, cap1920Int, cap2021Int, sport) {
	ws.set(null, {name: nameString, position: positionString,
		cap1415: cap1415Int, cap1516: cap1516Int,
		cap1617: cap1617Int, cap1718: cap1718Int,
		cap1819: cap1819Int, cap1920: cap1920Int,
		cap2021: cap2021Int, type: "Player", 
		sport: sport, team: sessionStorage.getItem("selectedTeam")
	}).on("success", function(data, response) {
	  console.log(data);
	  $("#new-player-button").popover("hide");
	  location.reload();
	});
}

var updateSalaryCapTables = function(sport){
		var options = { style: "currency", currency: "USD" };

		var cap = salarycap(sport);
		
		var sum1415 = 0;
		$(".Salary1415").each(function(){
			if(Number(this.textContent.replace(/[^0-9\.]+/g,"")) == 0){
				$(this).addClass("warning");
				$(this).css("background-color","blanchedalmond");
			}

			sum1415 += Number(this.textContent.replace(/[^0-9\.]+/g,""));
		});
		$("#1415Payroll").text(sum1415.toLocaleString("en-US",options));
		$("#1415Space").text((cap-sum1415).toLocaleString("en-US",options));

		if((cap-sum1415) < 0){
			$("#1415Space").css("color","tomato");
		} else {
			$("#1415Space").css("color","lightgreen");
		}	

		var sum1516 = 0;
		$(".Salary1516").each(function(){
			if(Number(this.textContent.replace(/[^0-9\.]+/g,"")) == 0){
				$(this).addClass("warning");
				$(this).css("background-color","blanchedalmond");
			}

			sum1516 += Number(this.textContent.replace(/[^0-9\.]+/g,""));
		});
		$("#1516Payroll").text(sum1516.toLocaleString("en-US",options));
		$("#1516Space").text((cap-sum1516).toLocaleString("en-US",options));

		if((cap-sum1516) < 0){
			$("#1516Space").css("color","tomato");
		} else {
			$("#1516Space").css("color","lightgreen");
		}	

		var sum1617 = 0;
		$(".Salary1617").each(function(){
			if(Number(this.textContent.replace(/[^0-9\.]+/g,"")) == 0){
				$(this).addClass("warning");
				$(this).css("background-color","blanchedalmond");
			}

			sum1617 += Number(this.textContent.replace(/[^0-9\.]+/g,""));
		});
		$("#1617Payroll").text(sum1617.toLocaleString("en-US",options));
		$("#1617Space").text((cap-sum1617).toLocaleString("en-US",options));

		if((cap-sum1617) < 0){
			$("#1617Space").css("color","tomato");
		} else {
			$("#1617Space").css("color","lightgreen");
		}	

		var sum1718 = 0;
		$(".Salary1718").each(function(){
			if(Number(this.textContent.replace(/[^0-9\.]+/g,"")) == 0){
				$(this).addClass("warning");
				$(this).css("background-color","blanchedalmond");
			}

			sum1718 += Number(this.textContent.replace(/[^0-9\.]+/g,""));
		});
		$("#1718Payroll").text(sum1718.toLocaleString("en-US",options));
		$("#1718Space").text((cap-sum1718).toLocaleString("en-US",options));

		if((cap-sum1718) < 0){
			$("#1718Space").css("color","tomato");
		} else {
			$("#1718Space").css("color","lightgreen");
		}	


		var sum1819 = 0;
		$(".Salary1819").each(function(){
			if(Number(this.textContent.replace(/[^0-9\.]+/g,"")) == 0){
				$(this).addClass("warning");
				$(this).css("background-color","blanchedalmond");
			}

			sum1819 += Number(this.textContent.replace(/[^0-9\.]+/g,""));
		});
		$("#1819Payroll").text(sum1819.toLocaleString("en-US",options));
		$("#1819Space").text((cap-sum1819).toLocaleString("en-US",options));

		if((cap-sum1819) < 0){
			$("#1819Space").css("color","tomato");
		} else {
			$("#1819Space").css("color","lightgreen");
		}	

		var sum1920 = 0;
		$(".Salary1920").each(function(){
			if(Number(this.textContent.replace(/[^0-9\.]+/g,"")) == 0){
				$(this).addClass("warning");
				$(this).css("background-color","blanchedalmond");
			}

			sum1920 += Number(this.textContent.replace(/[^0-9\.]+/g,""));
		});
		$("#1920Payroll").text(sum1920.toLocaleString("en-US",options));
		$("#1920Space").text((cap-sum1920).toLocaleString("en-US",options));

		if((cap-sum1920) < 0){
			$("#1920Space").css("color","tomato");
		} else {
			$("#1920Space").css("color","lightgreen");
		}	

		var sum2021 = 0;
		$(".Salary2021").each(function(){
			if(Number(this.textContent.replace(/[^0-9\.]+/g,"")) == 0){
				$(this).addClass("warning");
				$(this).css("background-color","blanchedalmond");
			}

			sum2021 += Number(this.textContent.replace(/[^0-9\.]+/g,""));
		});
		$("#2021Payroll").text(sum2021.toLocaleString("en-US",options));
		$("#2021Space").text((cap-sum2021).toLocaleString("en-US",options));

		if((cap-sum2021) < 0){
			$("#2021Space").css("color","tomato");
		} else {
			$("#2021Space").css("color","lightgreen");
		}	

		var id = sessionStorage.getItem("selectedTeam");

		var payroll = sum1415;
		var space = cap - sum1415;

		ws.update(id, { salarycap: payroll, capspace: space}).on('success', function(data,response){
			//do nothing for now
		});
	};

var deletePlayer = function(id, thisobj, sport){
	ws.destroy(id).on('success', function(data, response){
		thisobj.parent().parent().remove();	
		if($('#player-table tr').length < 2){
			$('#player-table > tbody:last').append("<tr><td>No Data To Display. Add a new player to get started.</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");
		}
		updateSalaryCapTables(sport);	
	});
};

var editPlayer = function(id, playername, positionstring, salary1415, salary1516, salary1617, salary1718, salary1819, salary1920, salary2021) {
	ws.update(id, { name : playername, position : positionstring, cap1415 : salary1415, cap1516 : salary1516, 
		cap1617 : salary1617, cap1718 : salary1718, cap1819 : salary1819, cap1920 : salary1920, cap2021 : salary2021 
	}).on('success', function(data,response){
		location.reload();
	});
};

var populatePlayerTable = function(sport) {
	var id = sessionStorage.getItem("selectedTeam");
	ws.search('[sport = "' + sport +'", type = "Player", team = "' + id +'" ]', {sort: 'position' }).on('success', function(data, response){
		if(data == undefined || data == [] || data == null || $.isEmptyObject(data)){
			$('#player-table > tbody:last').append("<tr><td>No Data To Display. Add a new player to get started.</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");
		}

		for (var id in data) {
		    var obj = data[id];
			
			var nameRow = "<td data-id='" + id + "'>" 
				+ "<i id='" + id + "-edit' class='fa fa-lg fa-pencil-square' style='margin-right:5px; color:blue'></i>" 
				+ "<i id='" + id + "-delete' class='fa fa-lg fa-times' style='margin-right:15px; color:red'></i>" 
				+ "<span id='" + id + "-name' data-id='" + id + "'>" + obj.name + "</span>" 
			+ "</td>";

			var options = { style: "currency", currency: "USD" };

			var positionRow = "<td>" + obj.position + "</td>";
			var cap1415 = "<td class='Salary1415'> <div class='pull-right'>" + Number(obj.cap1415).toLocaleString("en-US",options) + "</div></td>";
			var cap1516 = "<td class='Salary1516'> <div class='pull-right'>" + Number(obj.cap1516).toLocaleString("en-US",options) + "</div></td>";
			var cap1617 = "<td class='Salary1617'> <div class='pull-right'>" + Number(obj.cap1617).toLocaleString("en-US",options) + "</div></td>";
			var cap1718 = "<td class='Salary1718'> <div class='pull-right'>" + Number(obj.cap1718).toLocaleString("en-US",options) + "</div></td>";
			var cap1819 = "<td class='Salary1819'> <div class='pull-right'>" + Number(obj.cap1819).toLocaleString("en-US",options) + "</div></td>";
			var cap1920 = "<td class='Salary1920'> <div class='pull-right'>" + Number(obj.cap1920).toLocaleString("en-US",options) + "</div></td>";
			var cap2021 = "<td class='Salary2021'> <div class='pull-right'>" + Number(obj.cap2021).toLocaleString("en-US",options) + "</div></td>";
			
			var html = ["<tr>", nameRow, positionRow, cap1415, cap1516, cap1617, cap1718, cap1819, cap1920, cap2021, "</tr>" ].join("");
			
			$('#player-table > tbody:last').append(html);
			
			var position = obj.position;
			
			
			$('#' + id + '-delete').on("click", function(){
				var thisobj = $(this);
				if(BootstrapDialog.confirm('Are you sure you wish to delete this player?', function(result) {
					if(result){
						deletePlayer(thisobj.parent().attr('data-id'), thisobj, sport);
					}
				}));
			});

			var positionsArray = positionsList(sport);
			
			$('#' + id + '-edit').popover({
				placement: "right",
				trigger: "click",
				title: "Edit Player",
				content: '<div> \
						Please enter the data to edit the player here. All input fields must be filled. The salary fields may \
						only be numbers. If there is no salary for a year, enter a 0. \
						<br/> \
						<br/> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">Name</span> \
							<input id="' + id + 'name-input-field" type="text" class="form-control" placeholder="Enter Name Here" aria-describedby="basic-addon1" value="'+obj.name+'"> \
						</div> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">Position<span class="caret"></span></span> \
							<div class="dropdown" id="' + id + 'position-input-field"> \
							  <button class="btn btn-default dropdown-toggle" type="button" id="' + id + 'position-dropdown-button" data-toggle="dropdown" aria-expanded="true" style="width:139px"> \
							    Center \
							  </button> \
							  <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1"> \
							    ' + positionsArray +' \
							  </ul> \
							</div> \
						</div> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">14-15 Salary</span> \
							<input id="' + id + '1415-input-field" type="text" class="form-control" placeholder="Enter Salary Here" aria-describedby="basic-addon1" value="'+obj.cap1415+'"> \
						</div> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">15-16 Salary</span> \
							<input id="' + id + '1516-input-field" type="text" class="form-control" placeholder="Enter Salary Here" aria-describedby="basic-addon1" value="'+obj.cap1516+'"> \
						</div> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">16-17 Salary</span> \
							<input id="' + id + '1617-input-field" type="text" class="form-control" placeholder="Enter Salary Here" aria-describedby="basic-addon1" value="'+obj.cap1617+'"> \
						</div> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">17-18 Salary</span> \
							<input id="' + id + '1718-input-field" type="text" class="form-control" placeholder="Enter Salary Here" aria-describedby="basic-addon1" value="'+obj.cap1718+'"> \
						</div> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">18-19 Salary</span> \
							<input id="' + id + '1819-input-field" type="text" class="form-control" placeholder="Enter Salary Here" aria-describedby="basic-addon1" value="'+obj.cap1819+'"> \
						</div> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">19-20 Salary</span> \
							<input id="' + id + '1920-input-field" type="text" class="form-control" placeholder="Enter Salary Here" aria-describedby="basic-addon1" value="'+obj.cap1920+'"> \
						</div> \
						<div class="input-group"> \
							<span class="input-group-addon" style="width:105px">20-21 Salary</span> \
							<input id="' + id + '2021-input-field" type="text" class="form-control" placeholder="Enter Salary Here" aria-describedby="basic-addon1" value="'+obj.cap2021+'"> \
						</div> \
						<div class="btn-group" role="group" aria-label="..." style="margin-top:10px"> \
							<button type="button" id="' + id + 'cancel-button" class="btn btn-default">Cancel</button> \
							<button type="button" id="' + id + 'new-player-submit" class="btn btn-default">Submit</button> \
						</div> \
						<div id="' + id + 'warning-field"></div> \
					</div> \
					<script type="text/javascript"> \
						$("#' + id + 'position-dropdown-button").text("' + position.replace(/[^a-zA-Z ]/g, "") + '"); \
					    $("#' + id + 'position-dropdown-button").val("' + position.replace(/[^a-zA-Z ]/g, "") + '"); \
						$("#' + id + 'position-input-field li a").click(function(){ \
					      $("#' + id + 'position-dropdown-button").text($(this).text()); \
					      $("#' + id + 'position-dropdown-button").val($(this).text()); \
					   }); \
						$("#' + id + 'new-player-submit").on("click", function(){ \
							$("#' + id + 'warning-field").empty(); \
							if($("#' + id + 'name-input-field").val().length == 0 || $("#' + id + 'position-dropdown-button").text().length == 0 \
								|| $("#' + id + '1415-input-field").val().length == 0 || $("#' + id + '1516-input-field").val().length == 0 \
								|| $("#' + id + '1617-input-field").val().length == 0 || $("#' + id + '1718-input-field").val().length == 0 \
								|| $("#' + id + '1819-input-field").val().length == 0 || $("#' + id + '1920-input-field").val().length == 0 \
								|| $("#' + id + '2021-input-field").val().length == 0){ \
								$("#' + id + 'warning-field").append("<div style=margin-top:10px>You cant leave any fields empty. Please enter 0 if they have no salary for the year.</div>"); \
							} \
							else if (!( \
								isValidNumber($("#' + id + '1415-input-field").val()) && isValidNumber($("#' + id + '1516-input-field").val()) \
								&& isValidNumber($("#' + id + '1617-input-field").val()) && isValidNumber($("#' + id + '1718-input-field").val()) \
								&& isValidNumber($("#' + id + '1819-input-field").val()) && isValidNumber($("#' + id + '1920-input-field").val()) \
								&& isValidNumber($("#' + id + '2021-input-field").val()))) \
							{ \
								$("#' + id + 'warning-field").append("<div style=margin-top:10px>The fields for yearly salary may only be numbers. Please try again</div>"); \
							} \
							else \
							{ \
								editPlayer("' + id + '", $("#' + id + 'name-input-field").val(), $("#' + id + 'position-dropdown-button").text(), \
									$("#' + id + '1415-input-field").val(), \
									$("#' + id + '1516-input-field").val(), $("#' + id + '1617-input-field").val(), \
									$("#' + id + '1718-input-field").val(), \
									$("#' + id + '1819-input-field").val(), $("#' + id + '1920-input-field").val(), \
									$("#' + id + '2021-input-field").val()); \
							} \
						}); \
						$("#' + id + 'cancel-button").on("click", function(){ \
							$("#' + id + '-edit").popover("hide"); \
						}); \
					</script>',
				html: "true"
			});
		}
		updateSalaryCapTables(sport);
	});
}