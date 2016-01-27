(function () {
// ==UserScript==
// @name           MyFitnessPal Weight Watchers Points
// @version 1.3
// @description    Adds display of Weight Watcher points to any daily food diary page. Also adds "Real Calories" calculation based off 4/4/9 algorithm.
// @include        http://www.myfitnesspal.com/food/diary/*
// @include        https://www.myfitnesspal.com/food/diary/*
// ==/UserScript==
// Originally from: http://userscripts-mirror.org/scripts/show/122949
    
var usePointCalculation ="SmartPoints"; //Change to true to: 
                                        //                  original
                                        //                  PointsPlus
                                        //                  SmartPoints !make sure "Saturated Fat" ist listet in your MFP diary!
                                        // to change calculation formula 
    var precisonWW = false;             //Change to true for true fractional point values (instead of just .25, .50, and .75)
var totalPoints = 0;
/*
if (window.top !== window.self) {
  return; // do not run in frames
}
if (typeof unsafeWindow != 'undefined')
{
  (function page_scope_runner() {
    // If we're _not_ already running in the page, grab the full source
    // of this script.
    var my_src = '(' + page_scope_runner.caller.toString() + ')();';
    // Create a script node holding this script, plus a marker that lets us
    // know we are running in the page scope (not the Greasemonkey sandbox).
    // Note that we are intentionally *not* scope-wrapping here.
    var script = document.createElement('script');
    script.setAttribute('type', 'application/javascript');
    script.textContent = my_src;
    document.body.appendChild(script);
  }) ();
  return;
}
*/
function startRun() {
  var script = document.createElement('script');
  script.setAttribute('src', 'http://www.google.com/jsapi');
  script.addEventListener('load', function () {
    loadscripts_1();
  }, false);
  document.body.appendChild(script);
}
function getPointOld(calories, fat, fiber, carbs, protein, sugar)
{
 var points = 0;
 switch (usePointCalculation) {
        case "original":
         if (fiber > 4 ) {
             fiber = 4;
         }
         points = (calories / 50) + (fat / 12) - (fiber / 5);
         break;
        case "PointsPlus":
         points = (protein / 10.94) + (carbs / 9.17) + (fat / 3.89) - (fiber / 12.49);
         break;
        case "SmartPoints":
         points = (calories*0.0303) + (sugar*0.1212) + (fat*0.2727) - (protein*0.0970);
         break;
      }   
    
  //alert(points);

  if (precisonWW)
  {
    points = Math.round(points);
  } 
  else
  {
    var intPoints = Math.floor(points);
    fraction = points - intPoints;
    if (fraction < 0.25)
    points = intPoints + 0;
     else if (fraction >= 0.25 && fraction < 0.75)
    points = intPoints + 0.5;
     else
    points = intPoints + 1;
  }
  return points;
}
function main()
{
  $('tr:first').append('<th >');
  $('tr:not(:first)').append('<td>');
  var totalFound = false;
  var diaryTable$ = $('.table0');
  var totalPoints = 0;
  var columnIndexMap = {
    calories: -1,
    carbs: -1,
    fat: -1,
    fiber: -1,
    protein: -1,
    sugar: -1,
    remove: -1
  };
  //alert($(diaryTable$[12]).text());
  diaryTable$.find('tr').each(function (rowInd)
  {
    if (rowInd === 0 && $(this).hasClass('meal_header')) {
      $(this).append('<td class="alt">' + usePointCalculation +'</td>');
      columnIndexMap = BuildColumnIndexMap($(this));
    }
    if (!totalFound && $(this).hasClass('total'))
    {
      totalFound = true;
      $(this).find('td').eq(columnIndexMap.remove).html(totalPoints);
    }
    var fiber = 0;
    var calories = 0;
    var carbs = 0;
    var fat = 0;
    var protein = 0;
    var sugar = 0;  
    var cols = $(this).find('td').each(function (column)
    {
      var value = GetNumberFromCell($(this));
      console.log(column);
      switch (column) {
        case columnIndexMap.calories:
          calories = value;
          break;
        case columnIndexMap.carbs:
          carbs = value;
          break;
        case columnIndexMap.fat:
          fat = value;
          break;
        case columnIndexMap.fiber:
          fiber = value;
          break;
        case columnIndexMap.protein:
          protein = value;
          break;
        case columnIndexMap.sugar:
          sugar = value;
          break;      
        case columnIndexMap.remove-1:
          if ($(this).hasClass('delete')) {
            var points = getPointOld(calories, fat, fiber, carbs, protein, sugar);
            totalPoints += points;
            $(this).next().append(points);
          }
          break;
      }
    });
  });
}
function BuildColumnIndexMap(row$) {
  var columnIndexMap = {
    calories: -1,
    carbs: -1,
    fat: -1,
    fiber: -1,
    protein: -1,
    remove: -1
  };
  
  row$.find('td').each(function (index) {
    switch($(this).text()) {
      case "Calories":
        columnIndexMap.calories = index;
        break;
        case "Carbs":
        columnIndexMap.carbs = index;
        break;
        case "Fat":
        columnIndexMap.fat = index;
        break;
        case "Fiber":
        columnIndexMap.fiber = index;
        break;
        case "Protein":
        columnIndexMap.protein = index;
        break;
        case "Sugar":
        columnIndexMap.sugar = index;
        break;    
    }
  });
  
  columnIndexMap.remove = row$.find('td').length;
  
  return columnIndexMap;
}
function GetNumberFromCell(cell) {
  return parseInt(cell.text().replace(',', ''), 10);
}
function loadscripts_1()
{
  var script = document.createElement('script');
  script.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js');
  script.addEventListener('load', function () {
    loadscripts_2();
  }, false);
  document.body.appendChild(script);
}
function loadscripts_2()
{
  jQuery.noConflict();
  /* fix for old prototype conflict with google viz api */
  /* retrieves the Array reduce native function using cleverness */
  var ifr = document.createElement('iframe');
  document.body.appendChild(ifr);
  Array.prototype.reduce = ifr.contentWindow.Array.prototype.reduce;
  document.body.removeChild(ifr);
  google.load('visualization', '1', {
    packages: [
      'corechart'
    ],
    'callback': main
  });
}
startRun();
})();
