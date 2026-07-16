$fp = "c:\Users\jaime\metabolism ebook\index.html"
$c = [System.IO.File]::ReadAllText($fp)
$c = $c.Replace("`r`n", "`n")

$cssAnchor = '        .lesson-hero-img { animation: heroFadeIn 0.7s ease-out both; }' + "`n    </style>"

$cssNew = @'
        .lesson-hero-img { animation: heroFadeIn 0.7s ease-out both; }

        /* ===== PREMIUM DESIGN SYSTEM ===== */

        /* Styled first paragraph — larger, teal */
        .section-block > p:first-of-type {
            font-size: 1.15rem;
            color: #34657a;
            line-height: 1.9;
        }

        /* Drop cap on first letter */
        .section-block > p:first-of-type::first-letter {
            font-family: 'Cormorant Garamond', serif;
            font-size: 3.5rem;
            font-weight: 700;
            color: #c19a6b;
            float: left;
            line-height: 0.78;
            margin-right: 0.1em;
            margin-top: 0.08em;
        }

        /* Gold diamond bullets */
        .section-block ul.list-disc {
            list-style: none;
            padding-left: 0;
        }
        .section-block ul.list-disc > li {
            padding-left: 1.75rem;
            position: relative;
            margin-bottom: 0.45rem;
        }
        .section-block ul.list-disc > li::before {
            content: '\2736';
            position: absolute;
            left: 0;
            color: #c19a6b;
            font-size: 0.75rem;
            top: 0.2rem;
        }

        /* Pull quote */
        .pull-quote {
            border-left: 4px solid #c19a6b;
            background: #fafaf9;
            padding: 1.75rem 2rem 1.75rem 3rem;
            margin: 2.5rem 0;
            position: relative;
            border-radius: 0 0.5rem 0.5rem 0;
        }
        .pull-quote::before {
            content: '\201C';
            font-family: 'Cormorant Garamond', serif;
            font-size: 5rem;
            color: #c19a6b;
            opacity: 0.55;
            line-height: 1;
            position: absolute;
            top: 0.3rem;
            left: 0.6rem;
        }
        .pull-quote p {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.4rem;
            font-style: italic;
            color: #34657a;
            line-height: 1.75;
            margin: 0;
        }

        /* KEY INSIGHT box */
        .key-insight {
            background: #fafaf9;
            border: 1.5px solid #c19a6b;
            border-radius: 0.75rem;
            padding: 2rem 2.25rem;
            margin: 2.5rem 0;
            text-align: center;
            box-shadow: 0 4px 20px rgba(193,154,107,0.12);
        }
        .key-insight-label {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.6rem;
            font-weight: 700;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: #c19a6b;
            margin-bottom: 0.75rem;
        }
        .key-insight-fact {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.55rem;
            font-weight: 700;
            color: #34657a;
            line-height: 1.45;
        }

        /* Lesson summary box */
        .lesson-summary {
            border: 1.5px solid rgba(193,154,107,0.45);
            border-radius: 0.75rem;
            overflow: hidden;
            margin: 2.5rem 0;
        }
        .lesson-summary-header {
            background: #34657a;
            color: white;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            padding: 0.9rem 1.5rem;
            text-align: center;
        }
        .lesson-summary-body {
            background: #faf8f5;
            padding: 1.25rem 1.5rem;
        }
        .lesson-summary-item {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(193,154,107,0.15);
            font-size: 0.9rem;
            color: #374151;
            line-height: 1.6;
        }
        .lesson-summary-item:last-child {
            border-bottom: none;
        }
        .lesson-summary-diamond {
            color: #c19a6b;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            flex-shrink: 0;
        }

        /* Inline float images */
        .inline-img-right {
            float: right;
            width: 42%;
            margin: 0.25rem 0 1.5rem 1.75rem;
            clear: right;
        }
        .inline-img-left {
            float: left;
            width: 42%;
            margin: 0.25rem 1.75rem 1.5rem 0;
            clear: left;
        }
        .inline-img-border {
            border: 2px solid rgba(193,154,107,0.55);
            border-radius: 0.5rem;
            overflow: hidden;
        }
        .inline-img-border img {
            width: 100%;
            display: block;
        }
        .inline-img-caption {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.7rem;
            font-style: italic;
            color: #c19a6b;
            padding: 0.45rem 0.75rem;
            background: rgba(250,248,245,0.95);
            text-align: center;
        }
        .section-clearfix::after {
            content: '';
            display: table;
            clear: both;
        }

        @media (max-width: 767px) {
            .inline-img-right, .inline-img-left {
                float: none;
                width: 100%;
                margin: 1rem 0;
            }
            .pull-quote p { font-size: 1.2rem; }
            .key-insight-fact { font-size: 1.3rem; }
        }

    </style>
'@

$before = $c.Length; $c = $c.Replace($cssAnchor, $cssNew)
Write-Host ("CSS block: " + ($before -ne $c.Length))

[System.IO.File]::WriteAllText($fp, $c, [System.Text.Encoding]::UTF8)
Write-Host "Done."
