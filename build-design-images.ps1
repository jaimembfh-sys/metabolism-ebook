$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

# Insert a floated inline image after the first </h2> found after a section id anchor
function InsertImage($secId, $src, $caption, $dir) {
    $anchor = 'id="' + $secId + '"'
    $secIdx = $script:c.IndexOf($anchor)
    if ($secIdx -lt 0) { Write-Host ("  NOT FOUND: " + $secId); return }
    $h2End = $script:c.IndexOf('</h2>', $secIdx) + '</h2>'.Length
    $html = "`n            <div class=""inline-img-$dir"">" +
            "`n                <div class=""inline-img-border"">" +
            "`n                    <img src=""$src"" alt=""$caption"" loading=""lazy"">" +
            "`n                    <p class=""inline-img-caption"">$caption</p>" +
            "`n                </div>" +
            "`n            </div>"
    $script:c = $script:c.Insert($h2End, $html)
    Write-Host ("  Image OK: " + $secId + " (" + $dir + ")")
}

# Data: section id | image path | caption | float direction
InsertImage 'intro'  'images/4_-_Copy.png'       'Whole foods signal health to your cells'                    'right'
InsertImage 'ch2'    'images/6_-_Copy.png'        'Apple cider vinegar supports insulin sensitivity'           'left'
InsertImage 'ch3'    'images/9.png'               'Your gut communicates directly with your metabolism'        'right'
InsertImage 'ch4'    'images/13.png'              'Movement activates mitochondrial energy production'         'left'
InsertImage 'ch5'    'images/5_-_Copy.png'        'Stress and nervous system health directly impact thyroid function' 'right'
InsertImage 'ch6'    'images/photos.png'          'Hydration and morning rituals influence appetite hormones'  'left'
InsertImage 'ch7'    'images/11.png'              'Movement in nature supports leptin and ghrelin balance'     'right'
InsertImage 'ch8'    'images/12.png'              'Strength training accelerates metabolic flexibility'        'left'
InsertImage 'ch9'    'images/garlic__onions__broccoli__caulifower__eggs_and_asparagus.jpg' 'Ancestral whole foods form the foundation of a balanced plate' 'right'
InsertImage 'ch10'   'images/8_-_Copy.png'        'Cruciferous vegetables help clear harmful ceramides'        'left'
InsertImage 'ch11'   'images/9.png'               'Digestive health begins with what you put on your plate'   'right'
InsertImage 'ch12'   'images/5_-_Copy.png'        'Mindfulness and stillness directly heal the gut-brain axis' 'left'
InsertImage 'ch13'   'images/2_-_Copy.png'        'Strategic supplementation supports metabolic healing'       'right'
InsertImage 'ch14'   'images/pexels-esrakorkmaz-14677945.jpg' 'Preparing whole foods eliminates processed food exposure' 'left'
InsertImage 'ch15'   'images/2_-_Copy.png'        'Targeted nutrients rebuild metabolic function at the cellular level' 'right'
InsertImage 'ch16'   'images/11.png'              'Daily lifestyle rhythms are the foundation of metabolic health' 'left'
InsertImage 'ch17'   'images/13.png'              'The right movement for your body type changes everything'   'right'
InsertImage 'ch18'   'images/5_-_Copy.png'        'Healing your relationship with food is where transformation begins' 'left'

[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."
