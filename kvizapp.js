$(document).ready(function () {
  var data = "";
  var strana = 0;
  var stisknuteTlacitko = "";
  var poleOdpovedi = [];
  var randomCisla = [];
  var odpocet = 0;
  var pocetOtazek = 0;


  $("#buttonPre").hide();
  $("#buttonNext").hide();
  $(".odpocet").hide();
  $(".restart").hide();
  generujNahodnaCisla(10);
  refreshKonecneVysledky();

  //kliknuti na tlacitko start
  $(".start").click(function () {
    $(".nadpis").hide();
    $("h2").hide();
    $("p").hide();
    $(this).hide();
    $(".containerVysledky").hide();
    $("#buttonPre").show();
    $("#buttonNext").show();
    $(".odpocet").show();
    nacistOtazky();
    zacitOdpocet(90);
  });

  //kliknuti na tlacitko na konci kvizu pro restart kvizu
  $(".restart").click(function () {
    strana = 0;
    stisknuteTlacitko = "";
    poleOdpovedi = [];
    randomCisla = [];
    pocetOtazek = 0;
    generujNahodnaCisla(10);
    $(".nadpis").show();
    $("h2").show();
    $("p").show();
    $(".start").show();
    $(".containerVysledky").show();
    $(".nadpisVysledky").remove();
    $(".uspesnost").remove();
    $(".vysledek").remove();
    $(".odpocet").hide();
    $("#formular").hide();
    $("#uspesneUlozeni").remove();
    $(this).hide();
    refreshKonecneVysledky();
  });

  //kliknuti na tlacitko s predchozi otazkou
  $("#buttonPre").click(function () {
    $(".otazka").remove();
    $(".odpovedi").remove();
    $("#ukazatelOtazek").remove();
    vytvorKviz(strana - 1);
  });

  //kliknuti na tlacitko s nasledujici otazkou
  $("#buttonNext").click(function () {
    $(".otazka").remove();
    $(".odpovedi").remove();
    $("#ukazatelOtazek").remove();
    vytvorKviz(strana + 1);
  });

  //nacteni otazek z JSONu
  function nacistOtazky() {
    $.getJSON("otazky.json", function (soubor) {
      data = soubor;
      vytvorKviz(0);
    });
  }

  //vytvoreni odpoctu
  function zacitOdpocet(cas) {
    odpocet = cas - 1;
    counter = setInterval(timer, 1000);
    function timer() {
      $(".odpocetVteriny").text(odpocet);
      odpocet--;
      if (odpocet < 0) {
        clearInterval(counter);
        $(".odpocetVteriny").text(0);
        vytvorKviz(51);
        $(".otazka").remove();
        $(".odpovedi").remove();
        $("#ukazatelOtazek").remove();
      }
    }
  }

  //logika schovani tlacitek
  function schovatTlacitko() {
    if (pocetOtazek <= strana) {
      $("#buttonNext").hide();
    } else {
      $("#buttonNext").show();
    }

    if (strana <= 0) {
      $("#buttonPre").hide();
    } else if (pocetOtazek <= strana) {
      $("#buttonPre").hide();
    } else {
      $("#buttonPre").show();
    }
  }

  //generace nahodnych cisel pro náhodné zobrazeni otazek
  function generujNahodnaCisla(pocet) {
    pocetOtazek = pocet;
    while (randomCisla.length < pocetOtazek) {
      var r = Math.floor(Math.random() * 50);
      if (randomCisla.indexOf(r) === -1) {
        randomCisla.push(r);
      }
    }
  }

//logika vytvoreni stranky kvizu
  function vytvorKviz(str) {
    strana = str;
    schovatTlacitko();
    if (strana >= 0) {
      if (pocetOtazek < strana + 1) {
        strana = pocetOtazek;
        clearInterval(counter);
        var vysledky = "";
        var skore = 0;
        for (var w = 0; w < pocetOtazek; w++) {
          if (
            data[randomCisla[w]].spravnaOdpoved == poleOdpovedi[randomCisla[w]]
          ) {
            skore++;
            vysledky +=
              "<div class='vysledek'>" +
              data[randomCisla[w]].otazka +
              "<br> " +
              data[randomCisla[w]].odpovedi[poleOdpovedi[randomCisla[w]]] +
              "<i id='spravne' class='far fa-check-circle'></i></div>";
          } else if (
            data[randomCisla[w]].odpovedi[poleOdpovedi[randomCisla[w]]] ==
            undefined
          ) {
            vysledky +=
              "<div class='vysledek'>" +
              data[randomCisla[w]].otazka +
              "<br> Nebyla označena žádná odpověď <i id='spatne' class='far fa-times-circle'></i></div>";
          } else {
            vysledky +=
              "<div class='vysledek'>" +
              data[randomCisla[w]].otazka +
              "<br> " +
              data[randomCisla[w]].odpovedi[poleOdpovedi[randomCisla[w]]] +
              "<i id='spatne' class='far fa-times-circle'></i></div>";
          }
        }
        var uspesnost = (skore / pocetOtazek) * 100;
        uspesnost = uspesnost.toFixed(2);
        $(".restart").show();
        $("#output").append(
          "<h1 class='nadpisVysledky'>Výsledky<br> Tvé skóre je: " +
            skore +
            " z " +
            pocetOtazek +
            "<br></h1>"
        );
        $("#output").append(
          "<div class='uspesnost'>Úspěšnost: " + uspesnost + " %</div>"
        );
        $("#output").append(vysledky);
        $("#output").append(
            "<form id='formular'><label for='jmeno'>Zadejte svoje jméno:</label><input type='text' id='jmeno'/><input type='submit' value='Uložit výsledek' id='tlacitkoOdeslani'></form>"
        );
        $("#formular").submit(function (e) {
          e.preventDefault();
          let zadaneJmeno = $("#jmeno").val();
          if (zadaneJmeno != "") {
            ulozVysledekDoLocalStorage(zadaneJmeno, skore);
            $("#output").append("<span id='uspesneUlozeni'>Váš výsledek byl úspěšně uložen.</span>");
            $( "#jmeno" ).prop( "disabled", true );
            $( "#tlacitkoOdeslani" ).prop( "disabled", true );

          } else {
            alert("Prosím pro uložení výsledku zadejte vaše jméno!");
          }
      });

      } else {
        var otazka = data[randomCisla[strana]].otazka;
        var spravnaOdpovedCislo = data[randomCisla[strana]].spravnaOdpoved;
        spravnaOdpoved =
          data[randomCisla[strana]].odpovedi[spravnaOdpovedCislo];
        var odpovedi = "";
        var oznaceniSpravne = "";
        for (var i in data[randomCisla[strana]].odpovedi) {
          var aClass = "";
          if (data[randomCisla[strana]].mujVyber == i) {
            aClass = "oznacOdpoved";
          }
          if (i == spravnaOdpovedCislo) {
            oznaceniSpravne = "*";
          } else {
            oznaceniSpravne = "";
          }
          odpovedi +=
            '<div class="odpovedi"> <div class="tlacitko ' +
            aClass +
            '" data-id="' +
            parseInt(i) +
            '">' +
            data[randomCisla[strana]].odpovedi[i] +
            "</div></div>";
        }
        $("#output").append("<div class='otazka'>" + otazka + "</div>");
        $("#output").append(odpovedi);
        $(".row").append(
          "<div id='ukazatelOtazek'>Otázka " +
            (strana + 1) +
            "/" +
            pocetOtazek +
            "</div>"
        );

        for (var x = 0; x < $(".tlacitko").length; x++) {
          $(".tlacitko")
            .eq(x)
            .click(function () {
              stisknuteTlacitko = $(this);
              odpovedUzivatele();
            });
        }
      }
    }
  }

  //logika zaznamenavani odpovedi uzivatele
  function odpovedUzivatele() {
    var vysledek = "";
    var iId = $(stisknuteTlacitko).attr("data-id");
    data[randomCisla[strana]].mujVyber = iId;

    poleOdpovedi[randomCisla[strana]] = iId;
    for (var x = 0; x < $(".tlacitko").length; x++) {
      if (x == iId) {
        $(".tlacitko").eq(x).addClass("oznacOdpoved");
      } else {
        $(".tlacitko").eq(x).removeClass("oznacOdpoved");
      }
    }
  }
});

//ziskani jiz uložených konečných výsledků z local storage
function getKonecneVysledky() {
  return (typeof(localStorage.getItem("konecneVysledky"))=='undefined' ? [] : JSON.parse(localStorage.getItem("konecneVysledky")));
}

//ukladani vysledku do local storage
function ulozVysledekDoLocalStorage(jmeno, vysledek) {
  konecneVysledky = getKonecneVysledky() === null ? [] : getKonecneVysledky();
  zaznam = [jmeno, vysledek];

  konecneVysledky.push(zaznam);
  localStorage.setItem("konecneVysledky", JSON.stringify(konecneVysledky));
}

//vytvoreni vysledkové tabule na startovni strance
function refreshKonecneVysledky() {
  ulozeneVysledky = getKonecneVysledky();
  let container = $('<p class="vysledek"/>');

  $.each(ulozeneVysledky, function (i) {
    container.text(ulozeneVysledky[i][0] + ' získal ' + ulozeneVysledky[i][1] + ' z 10.');
    $('#konecneVysledky').append(container.clone());
  });
}


