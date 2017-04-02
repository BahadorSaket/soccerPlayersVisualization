

var data;
function setDefaultData()
{
   d3.csv("data/final_player_data.csv", function(data_raw){
      data = data_raw;
      // console.log("csv returned: ");
      // console.log(data);
	  // set default filter for initial page view
	  triggerFilters();
    });
}



function toggleFilterSection(filter_type) {

	if($('.' + filter_type + '-filter-options').is(':visible')) {
		$('.' + filter_type + '-filter-options').hide();
		$('#' + filter_type + '-arrow').html('<i class="fa fa-chevron-down"></i>');
	} else {
		$('.' + filter_type + '-filter-options').show();
		$('#' + filter_type + '-arrow').html('<i class="fa fa-chevron-up"></i>');
	}
}

function triggerFilters() {
	// if year attribute exists, then filter by year (timeline) in addition to any existing filters
	// if name is selected, show only that player and un-check all filters
	// TO DO - what if someone only types part of a name?? show all those players, or ask them to re-select??
	// if filters are selected, loop through all filter-val inputs and add checked ones to a string
	// return key:value (variable:value) pairs if name or any filters are selected
	// otherwise, show all data just based on year
	filters = [];
	var year = $('#slider').slider("option", "value");
	filters.push({key: "Season", val: "1-Jan-"+year});
	var player = $('#player-name').val();
	if(player != "") {
		filters.push({key: "Name", val: player});
		$('.filter-val').removeAttr('checked');
	} else {
		$("input[class='filter-val']:checked").each(function() {
	      	var key = $(this).closest(".filter-toggle").attr("id");
	      	var val = $(this).val();
	      	filters.push({key: key, val: val});
		});
	}
	filterData(filters, year);
}

// clear all filters if clear link is selected
// filter array = year only
// clear all checked boxes and empty the name field
function clearAllFilters() {
	var year = $('#slider').slider("option", "value");
	filters = [];
	filters.push({key: "Season", val: "1-Jan-"+year});
	$('#player-name').val('');
	$('.filter-val').removeAttr('checked');
	filterData(filters, year);
}

// get data from csv
// filter based on filter key/val pairs
	// only add to filtered dataset if not there already
// return filtered data to reload map
function filterData(filters, year) {
	$('.details-box').html('Select a player to view details');
	var nest = d3.nest()
		.key(function(d) { return d["key"]; })
		.entries(filters);
    map_filtered =[];
    line_filtered =[];
   	for(i=0;i<data.length;i++) {
   		var season = parseFloat(data[i]["Season"].split("-")[2]);
   		var dob = parseFloat(data[i]["DOB"].split("-")[2]);
   		var age = 2015 - dob;
		var map_match = 0;
		var line_match = 0;
		var count = 0;
   		for(filter_array in nest) {
   			// console.log(nest[array]["values"]);
   			subarray = nest[filter_array]["values"];
   			var map_val = false;
   			var line_val = false;
   			$(subarray).each(function(index, filter) {
   				if(data[i][filter["key"]] == filter["val"] || filter["key"] == "Age" && age == filter["val"]) {
   					// console.log('match! - ' + filter["val"] + " = " + data[i][filter["key"]]);
   					map_val = true;
   					line_val = true;
   				} else if(filter["key"] == "Season" && (season > year || year==2015)) {
   					// console.log('match (LINE ONLY)! - ' + filter["val"] + " = " + data[i][filter["key"]]);
   					line_val = true;
   				} else {
   					// console.log('no match :( - ' + filter["val"] + " != " + data[i][filter["key"]]);
   				}
   			});
   			count++;
   			if(map_val == true) map_match++;
   			if(line_val == true) line_match++;
   			// console.log(map_val);
   			// console.log(map_match);
   			// console.log(line_val);
   			// console.log(line_match);
   			// console.log(count);
		}
		if(line_match == count) line_filtered.push(data[i]);	
		if(map_match == count) map_filtered.push(data[i]);	
		// show detail box if filter returns only one player
	}
	if(map_filtered.length == 1) populateDetailBox(map_filtered[0]);

	// final filter of data
	final_line_data = [];
	var data_for_linechart = d3.nest()
		.key(function(d) {return d.Name;})
		.entries(line_filtered);
		data_for_linechart.forEach(function(d) { 
			for(i=0;i<d.values.length;i++) {
				if(parseFloat(d.values[i].Season.split("-")[2]) == year) {
					final_line_data.push(d);
				}
			}
		});
		if(final_line_data.length != 0) {
			// send filtered_data array to MAP
		  	__gl.tower.broardcast("filter_any", map_filtered);
		  	// show div and send filtered data to LINE CHART
		  	$('.no-data').remove();
			$('#canvas').show();
			visualizeLineChart(line_filtered, final_line_data);
		} else {
			$('#canvas').hide();
		  	$('.no-data').remove();
			$('.main-page').append("<div class='no-data' style='width:2000px; padding-top:300px; text-align:center'>No data here for this year and these filters.</div>");
		}
  	// console.log('checking filtering counts........');
  	// console.log(map_filtered);
  	// console.log(final_line_data);

}

var image;
function populateDetailBox(details) {
	$('.details-box').html('');
	d3.csv("data/player_img_db.csv", function(imgs){
		for(x=0;x<imgs.length;x++) {
			if(imgs[x]["Name"]==details["Name"]) {
				var season = parseFloat(details["Season"].split("-")[2]);
				image = imgs[x]["Image URL"];
				var image_html = "<div class='player-image'><img src='" + image + "'></div>";
				$('.details-box').append(image_html);
				var html = "<div class='name-details'><strong>" + details["Name"] + "</strong></div> <div class='mv-details'>" + season + " Market Value: &pound;" + details["MV"].formatMoney(2) + "</div> <div class='rank-details'>2015 Rank: " + details["2015 Rank"] + "</div> <div class='number-details'>Number: " + details["Number"] + "</div> <div class='dob-details'>DOB: " + details["DOB"] + "</div> <div class='nationality-details'>Nationality: " + details["Nationality"] + "</div> <div class='position-details'>Position: " + details["Field position"] + "</div> <div class='club-details'>" + season + " Club: " + details["Club"] + "</div>";
				setTimeout(function() { $('.details-box').append(html) }, 5);
			}
		}
    });
}

function getPlayerDetails(name, year) {
	image_data = [];
   	for(i=0;i<data.length;i++) {
   		if(data[i]["Name"]==name && data[i]["Season"]==year) {
   			return data[i];
   		}
   	}
}

function getClubPlayerList(club) {
	club_names = [];
	var year = $('#slider').slider("option", "value");
    year = "1-Jan-"+year;
   	for(i=0;i<data.length;i++) {
   		if(data[i]["Club"]==club && data[i]["Season"]==year) {
   			club_names.push(data[i]["Name"]);
   		}
   	}
   	// console.log("CLUB LIST -----");
   	// console.log(club_names);
   	FilteredLineChart(club_names)
}

Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

// load player names for autocomplete
function loadPlayerNames() {
    var player_names = [
		"Aaron Ramsey",
		"Abdul Rahman Baba",
		"Adam Lallana",
		"Adem Ljajic",
		"Aderlan Santos",
		"Admir Mehmedi",
		"Adnan Januzaj",
		"Adrián Ramos",
		"Adriano",
		"Alberto Moreno",
		"Aleix Vidal",
		"Aleksandar Mitrovic",
		"Alessandro Florenzi",
		"Alessio Cerci",
		"Alessio Romagnoli",
		"Alex Oxlade-Chamberlain",
		"Alex Sandro",
		"Alexis Sánchez",
		"Allan",
		"Álvaro Domínguez",
		"Álvaro Morata",
		"Álvaro Negredo",
		"Ander Herrera",
		"Ander Iturraspe",
		"André Ayew",
		"André Gomes",
		"André Schürrle",
		"Andrea Bertolacci",
		"Andrea Ranocchia",
		"Andrés Iniesta",
		"Anthony Martial",
		"Antoine Griezmann",
		"Antonio Candreva",
		"Antonio Rüdiger",
		"Arda Turan",
		"Arjen Robben",
		"Arturo Vidal",
		"Asier Illarramendi",
		"Atsuto Uchida",
		"Aymen Abdennour",
		"Aymeric Laporte",
		"Bas Dost",
		"Bastian Schweinsteiger",
		"Benedikt Höwedes",
		"Bernd Leno",
		"Borja Valero",
		"Branislav Ivanovic",
		"Bruno Soriano",
		"Carlos Bacca",
		"Carlos Vela",
		"Carlos Zambrano",
		"Casemiro",
		"Cédric Bakambu",
		"César Azpilicueta",
		"Cesc Fàbregas",
		"Charles Aránguiz",
		"Chicharito",
		"Chris Smalling",
		"Christian Benteke",
		"Christian Eriksen",
		"Christoph Kramer",
		"Ciro Immobile",
		"Claudio Bravo",
		"Claudio Marchisio",
		"Coutinho",
		"Cristiano Ronaldo",
		"Daley Blind",
		"Dani Alves",
		"Dani Parejo",
		"Daniel Caligiuri",
		"Daniel Carriço",
		"Daniel Carvajal",
		"Daniel Sturridge",
		"Daniele De Rossi",
		"Daniele Rugani",
		"Danilo",
		"Danny Welbeck",
		"David Alaba",
		"David de Gea",
		"David López",
		"David Silva",
		"Dejan Lovren",
		"Denis Cheryshev",
		"Denis Suárez",
		"Diego Alves",
		"Diego Costa",
		"Diego Godín",
		"Diego Perotti",
		"Dimitri Payet",
		"Domenico Berardi",
		"Dória",
		"Douglas Costa",
		"Dries Mertens",
		"Dusan Tadic",
		"Duván Zapata",
		"Eden Hazard",
		"Éder",
		"Edin Dzeko",
		"Eliaquim Mangala",
		"Emre Can",
		"Enzo Pérez",
		"Eric Maxim Choupo-Moting",
		"Érik Lamela",
		"Éver Banega",
		"Evgen Konoplyanka",
		"Fabian Johnson",
		"Falcao",
		"Felipe Anderson",
		"Fernandinho",
		"Fernando",
		"Fernando Llorente",
		"Fernando Torres",
		"Filip Kostic",
		"Filipe Luís",
		"Florian Thauvin",
		"Franck Ribéry",
		"Franco Di Santo",
		"Franco Vázquez",
		"Fredy Guarín",
		"Gabi",
		"Gareth Bale",
		"Gary Cahill",
		"Gary Medel",
		"Geoffrey Kondogbia",
		"Georginio Wijnaldum",
		"Gerard Piqué",
		"Gervinho",
		"Giacomo Bonaventura",
		"Giorgio Chiellini",
		"Giuseppe Rossi",
		"Gonzalo Castro",
		"Gonzalo Higuaín",
		"Granit Xhaka",
		"Grzegorz Krychowiak",
		"Guilherme Siqueira",
		"Hakan Calhanoglu",
		"Haris Seferovic",
		"Harry Kane",
		"Henrikh Mkhitaryan",
		"Hernanes",
		"Heung-Min Son",
		"Holger Badstuber",
		"Hugo Lloris",
		"Iago Falqué",
		"Ignacio Camacho",
		"Ignazio Abate",
		"Iker Muniain",
		"Ilkay Gündogan",
		"Iñigo Martínez",
		"Isco",
		"Ivan Perisic",
		"Ivan Rakitic",
		"Jack Wilshere",
		"Jackson Martínez",
		"Jakub Blaszczykowski",
		"James McCarthy",
		"James Milner",
		"James Rodríguez",
		"Jan Oblak",
		"Jan Vertonghen",
		"Javi Fuego",
		"Javi Martínez",
		"Javier Mascherano",
		"Jay Rodríguez",
		"Jeison Murillo",
		"Jérémy Mathieu",
		"Jérémy Ménez",
		"Jérôme Boateng",
		"Jesé",
		"Jesús Navas",
		"Joaquín Correa",
		"Joe Hart",
		"Joel Matip",
		"Johannes Geis",
		"John Stones",
		"Jonas Hector",
		"Jonathan de Guzmán",
		"Jonathan Tah",
		"Jonathas",
		"Jordan Henderson",
		"Jordi Alba",
		"Jorginho",
		"José Callejón",
		"José Giménez",
		"José Luis Gayá",
		"José Salomón Rondón",
		"Josip Drmic",
		"Josuha Guilavogui",
		"Juan Bernat",
		"Juan Cuadrado",
		"Juan Iturbe",
		"Juan Jesus",
		"Juan Mata",
		"Juanfran",
		"Julian Brandt",
		"Julian Draxler",
		"Julian Weigl",
		"Júnior Caiçara",
		"Kalidou Koulibaly",
		"Kamil Glik",
		"Karim Bellarabi",
		"Karim Benzema",
		"Keisuke Honda",
		"Keita Baldé",
		"Kevin De Bruyne",
		"Kévin Gameiro",
		"Kevin Kampl",
		"Kevin Mirallas",
		"Kevin Strootman",
		"Kevin Volland",
		"Keylor Navas",
		"Kieran Gibbs",
		"Kiko Casilla",
		"Kingsley Coman",
		"Klaas-Jan Huntelaar",
		"Koke",
		"Konstantinos Manolas",
		"Kwadwo Asamoah",
		"Kyle Walker",
		"Kyriakos Papadopoulos",
		"Lars Bender",
		"Lars Stindl",
		"Laurent Koscielny",
		"Leandro Castán",
		"Leighton Baines",
		"Leon Goretzka",
		"Leonardo Bonucci",
		"Leroy Sané",
		"Lionel Messi",
		"Lorenzo Insigne",
		"Lucas Biglia",
		"Lucas Digne",
		"Luciano Vietto",
		"Luis Muriel",
		"Luis Suárez",
		"Luiz Adriano",
		"Luiz Gustavo",
		"Luka Modric",
		"Lukasz Piszczek",
		"Luke Shaw",
		"Mamadou Sakho",
		"Manolo Gabbiadini",
		"Manuel Neuer",
		"Marc Bartra",
		"Marc-André ter Stegen",
		"Marcel Schmelzer",
		"Marcelo",
		"Marcelo Brozovic",
		"Marco Parolo",
		"Marco Reus",
		"Marcos Rojo",
		"Marek Hamsik",
		"Mario Balotelli",
		"Mario Götze",
		"Mario Mandzukic",
		"Mario Suárez",
		"Markel Susaeta",
		"Marouane Fellaini",
		"Martín Cáceres",
		"Martín Montoya",
		"Martin Skrtel",
		"Mateo Kovacic",
		"Mateo Musacchio",
		"Mati Fernández",
		"Matija Nastasic",
		"Mats Hummels",
		"Matteo Darmian",
		"Matthias Ginter",
		"Mattia De Sciglio",
		"Mattia Destro",
		"Mattia Perin",
		"Mauro Icardi",
		"Max Kruse",
		"Max Meyer",
		"Maximilian Arnold",
		"Medhi Benatia",
		"Memphis Depay",
		"Mesut Özil",
		"Mikel Rico",
		"Miralem Pjanic",
		"Miranda",
		"Mohamed Salah",
		"Morgan Schneiderlin",
		"Moussa Dembélé",
		"Moussa Sissoko",
		"Munir El Haddadi",
		"Nacer Chadli",
		"Nathaniel Clyne",
		"Nemanja Matic",
		"Neto",
		"Neven Subotic",
		"Neymar",
		"Nicola Sansone",
		"Nicolás Otamendi",
		"Nigel de Jong",
		"Niklas Süle",
		"Nolito",
		"Nuri Sahin",
		"Óliver Torres",
		"Olivier Giroud",
		"Ömer Toprak",
		"Oscar",
		"Pablo Piatti",
		"Pablo Zabaleta",
		"Paco Alcácer",
		"Patrick Herrmann",
		"Paul Pogba",
		"Paulo Dybala",
		"Pedro",
		"Pepe",
		"Per Mertesacker",
		"Phil Jones",
		"Philipp Lahm",
		"Pierre-Emerick Aubameyang",
		"Pierre-Emile Höjbjerg",
		"Radja Nainggolan",
		"Raffael",
		"Rafinha",
		"Raheem Sterling",
		"Ramires",
		"Raphaël Varane",
		"Raúl García",
		"Ricardo Rodríguez",
		"Riccardo Saponara",
		"Robert Lewandowski",
		"Roberto Firmino",
		"Roberto Pereyra",
		"Roberto Soldado",
		"Roberto Soriano",
		"Robin Knoche",
		"Rodrigo",
		"Roman Bürki",
		"Roman Neustädter",
		"Romelu Lukaku",
		"Ron-Robert Zieler",
		"Ross Barkley",
		"Sadio Mané",
		"Saido Berahino",
		"Sami Khedira",
		"Samir Handanovic",
		"Samir Nasri",
		"Samu Castillejo",
		"Samuel",
		"Santi Cazorla",
		"Santi Mina",
		"Saúl Níguez",
		"Sead Kolasinac",
		"Seamus Coleman",
		"Sebastian Rode",
		"Senad Lulic",
		"Sergi Roberto",
		"Sergio Agüero",
		"Sergio Busquets",
		"Sergio Ramos",
		"Shinji Kagawa",
		"Shkodran Mustafi",
		"Sime Vrsaljko",
		"Simone Zaza",
		"Sofiane Feghouli",
		"Sokratis",
		"Stefan de Vrij",
		"Stefan Kießling",
		"Stefan Radu",
		"Stefan Savic",
		"Stefano Sturaro",
		"Stephan Lichtsteiner",
		"Stevan Jovetic",
		"Steven N'Zonzi",
		"Sven Bender",
		"Theo Walcott",
		"Thiago",
		"Thibaut Courtois",
		"Thomas Müller",
		"Thorgan Hazard",
		"Timo Horn",
		"Timo Werner",
		"Tin Jedvaj",
		"Toby Alderweireld",
		"Toni Kroos",
		"Tony Jantschke",
		"Vicente Iborra",
		"Victor Wanyama",
		"Vieirinha",
		"Vincent Kompany",
		"Vitolo",
		"Wayne Rooney",
		"Wendell",
		"Wilfried Bony",
		"Willian",
		"Wojciech Szczesny",
		"Xherdan Shaqiri",
		"Yann Sommer",
		"Yannick Ferreira Carrasco",
		"Yaya Touré",
		"Yohan Cabaye",
		"Yunus Malli",
		"Yuto Nagatomo",
		"Zlatko Junuzovic"
	];
    $( "#player-name" ).autocomplete({
      source: player_names
    });
}
