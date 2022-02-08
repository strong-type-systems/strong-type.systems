#! /usr/bin/env python3

"""
    usage:
        $ ./generate_media_queries.py > variations.generated.css
"""


def print_media_queries(minSize, maxSize, step, unit, minFontsize, maxFontsize):
    print(f"""\
:root {{
    --animation-position-mediaq: {minSize};
    --logo-font-size-numeric: {minFontsize};
    --animation-progress: 0;
}}""")

    for pos in range(minSize + step, maxSize + step, step):
        progress = (pos - minSize) / (maxSize - minSize)
        fontsize = (maxFontsize - minFontsize) * progress + minFontsize
        # max-width means: equal or narrower
        # min-width means: equal or wider
        print(f"""\
@media (min-width: {pos}{unit}) {{
    :root {{
        --animation-progress: {progress};
        --animation-position-mediaq: {pos};
        --logo-font-size-numeric: {fontsize};
    }}
}}""")

if __name__ == '__main__':
    # using step 5 for used queries
    # and step 1 for the query at 24em ... :-/
    print_media_queries(20, 100, 1 , 'em', 1.5, 50/12)
