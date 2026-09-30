"""Indian number formatting + amount in words.

Shared by both invoice and quotation engines.
Matches the wording style on the original MMW documents.
"""
from decimal import Decimal, ROUND_HALF_UP


def D(x) -> Decimal:
    """Quantize to 2 decimal places."""
    return Decimal(str(x)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def fmt_inr(x) -> str:
    """Format with Indian lakh/crore grouping: 1199125.5 -> '11,99,125.50'"""
    x = D(x)
    neg = x < 0
    x = abs(x)
    whole, frac = f'{x:.2f}'.split('.')
    if len(whole) > 3:
        head, tail = whole[:-3], whole[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        whole = ','.join(parts) + ',' + tail
    return ('-' if neg else '') + whole + '.' + frac


_ONES = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
]
_TENS = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety',
]


def _below_100(n: int) -> str:
    if n < 20:
        return _ONES[n]
    return (_TENS[n // 10] + (' ' + _ONES[n % 10] if n % 10 else ''))


def _below_1000(n: int) -> str:
    h, r = divmod(n, 100)
    out = []
    if h:
        out.append(_ONES[h] + ' Hundred')
    if r:
        out.append(('And ' if h else '') + _below_100(r))
    return ' '.join(out)


def _int_words(n: int) -> str:
    if n == 0:
        return 'Zero'
    parts = []
    for div, name in ((10**7, 'Crore'), (10**5, 'Lakh'), (1000, 'Thousand')):
        q, n = divmod(n, div)
        if q:
            plural = 's' if (q > 1 and name in ('Crore', 'Lakh')) else ''
            parts.append(
                f'{_below_100(q) if q < 100 else _int_words(q)} {name}{plural}'
            )
    if n:
        parts.append(_below_1000(n))
    return ' '.join(parts)


def amount_in_words(x) -> str:
    """Convert amount to words: 199125 -> 'One Lakh Ninety Nine Thousand One Hundred And Twenty Five Only.'"""
    x = D(x)
    rupees = int(x)
    paise = int((x - rupees) * 100)
    s = _int_words(rupees)
    if paise:
        s += f' And {_below_100(paise)} Paise'
    return s + ' Only.'
