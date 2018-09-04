<!--
  Das ist das Markdown Handbuch für die dérive Website.

  Das Handbuch enthält sämtliche Markdown Features die wir verwenden,
  und dient somit als praktisches Nachschlagewerk dass beim verfassen
  von neuen Markdowntexten hilft.

  In zweiter Linie dient es auch als Bindeglied zwischen der inhaltlichen
  und der technischen Umsetzung der Seite - Bei der technischen Umsetzung der
  Websites kann die ProgrammiererIn hier nachsehen welche Markdown Features
  die Website unterstützen muss, und umgekehrt können sich alle Verfasser von
  Inhalten darauf verlassen, dass diese dann auch korrekt dargestellt werden.

  Das Handbuch ist selbst als Markdown Dokument verfasst, in der oberen
  Menüleiste von Atom unter "Packages" -> "Markdown Preview" -> "Toggle Preview"
  kann ein Markdown Preview Panel geöffnet werden, dessen Inhalt sich
  automatisch aktualisiert wenn man hier in diesem Dokument Dinge verändert
  und ausprobiert - was erlaubt und erwünscht ist!
-->

*Kursiver Text*

**Fetter Text**

# Erste Überschrift

## Zweite Überschrift

### Dritte Überschrift

<https://beispiel.com/website/link/ohne/beschreibung>

<email.link@beispiel.com>

[Linktext](www.beispiel.com)

![Bilduntertitel](/Pfad/eines/bildes.jpg)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Für eine erzwungene Einrückung des Beginns einer einzelnen Zeile kann man eine beliebige Anzahl von "&nbsp;" (Non-breaking space HTML Entity) verwenden.

Ein Stern im Text der nicht als Beginn eines kursiven Textes interpretiert
werden soll muss mit einem Backslash davor versehen werden: \*


<!--
  Anmerkung: Die folgenden Features werden im Markdown Preview Panel von Atom
             nicht korrekt dargestellt, da sie weniger stark verbreiteten
             Markdown Standards enstammen. Auf der Website werden sie aber -
             wie alle anderen Features oberhalb auch - voll unterstützt!
-->


<!-- Vimeo Embed: -->

<iframe src="http://player.vimeo.com/video/123456789" width="500" height="281" frameborder="0" webkitAllowFullScreen="webkitAllowFullScreen" mozallowfullscreen="mozallowfullscreen" allowFullScreen="allowFullScreen"></iframe>


<!-- Youtube Embed: -->

<iframe width="640" height="360" src="http://www.youtube.com/embed/xCpmfBWRPPM?feature=player_detailpage" frameborder="0" allowfullscreen="allowfullscreen"></iframe>


<!-- Bibliographische Verweise bzw. Fussnoten: -->

Ein bibliographischer Quellenhinweis[^1] innerhalb eines Textes.

(...)

[^1]:
   64:     Siehe: <http://www.beispiel.com/quelle> (Stand 25.02.2009)
