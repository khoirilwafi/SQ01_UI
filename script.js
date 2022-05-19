var gain      = 0;
var volume    = -79;
var balance   = 0;
var high_self = 0;
var loudness  = 0;

var bass      = 0;
var middle    = 0;
var treble    = 0;
var subwoofer = -79;

var knob_active = 'none';
var prev_value = null;
var data_setup;
var socket;

var gateway = `ws://${window.location.hostname}/ws`;

window.addEventListener('load',onload);

function onload()
{ 
    socket = new WebSocket(gateway);
    socket.onopen    = socket_open;
    socket.onclose   = socket_close;
    socket.onmessage = socket_message;
}

function socket_message(event)
{
    data_setup = event.data;
    console.log(event.data);
    setup();
}

function setup()
{
    let index = 0;

    for(let i=0; i<15; i++)
    {
        let id   = data_setup.charAt(index);
        let len  = parseInt(data_setup.charAt(index+1));
        let data = parseInt(data_setup.substring(2+index,(2+index)+len));

        index += len+2;

        if(id == 'A'||id == 'G'||id == 'I'||id == 'K'||id == 'M'||id == 'O')
        {
            document.getElementById(id+len+data).style.background = 'green';
        }
        else
        {
            switch(id)
            {
                case 'B' :
                    gain = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(gain, 0,15, 0,270) + 'deg)';
                break;

                case 'C' :
                    volume = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(volume, -79,15, 0,270) + 'deg)';
                break;

                case 'D' :
                    balance = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(balance, -79,79, 0,270) + 'deg)'; 
                break;

                case 'E' :
                    high_self = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(high_self, 0,22, 0,270) + 'deg)';
                break;

                case 'F' :
                    loudness = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(loudness*(-1), 0,15, 0,270) + 'deg)';
                break;

                case 'H' :
                    bass = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(bass, -15,15, 0,270) + 'deg)';
                break;

                case 'J' :
                    middle = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(middle, -15,15, 0,270) + 'deg)';
                break;

                case 'L' :
                    treble = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(treble, -15,15, 0,270) + 'deg)';
                break;

                case 'N' :
                    subwoofer = data;
                    document.getElementById(id).style.transform = 'rotate(' + scale(subwoofer, -79,15, 0,270) + 'deg)';
                break;
            }
        }
    }
}

function socket_open(event)
{
    
}

function socket_close(event)
{
    
}

function scale(value, from_min, from_max, to_min, to_max)
{
    let from_range = from_max-from_min;
    let to_range   = to_max-to_min;
    let end_value  = (value-from_min)*(to_range/from_range)+to_min;

    return end_value.toFixed();
}
 
function label_onclick(element)
{
    let id     = element.id;
    let div_id = id.substring(0,(id.length)-1);
    let device = document.getElementById(div_id).querySelectorAll('.label');

    for(let i=0; i<device.length; i++)
    {
        device[i].style.background = 'transparent';
    }

    document.getElementById(id).style.background = 'green';
    socket.send(id);
}

function knob_onclick(element)
{
    let id = element.id;

    if(id != knob_active)
    {
        let top_offset  = document.getElementById(id).offsetTop;
        let left_offset = document.getElementById(id).offsetLeft;

        document.getElementById('db_value').style.top  = top_offset + 34 + 'px';
        document.getElementById('db_value').style.left = left_offset + 8 + 'px';
        document.getElementById('db_value').style.opacity = '70%';

        knob_active = id;

        switch (knob_active)
        {
            case 'B' : 
                document.getElementById('db_value').innerHTML = gain + ' dB'; 
                set_fader_level(scale(gain, 0,15, 0,100));
                prev_value = null;
            break;

            case 'C' :
                document.getElementById('db_value').innerHTML = volume + ' dB';
                set_fader_level(scale(volume, -79,15, 0,100));
                prev_value = null;
            break;

            case 'D' :
                document.getElementById('db_value').innerHTML = balance; 
                set_fader_level(scale(balance, -79,79, 0,100));
                prev_value = null;
            break;

            case 'E' :
                document.getElementById('db_value').innerHTML = high_self + ' dB'; 
                set_fader_level(scale(high_self, 0,22, 0,100));
                prev_value = null;
            break;

            case 'F' :
                document.getElementById('db_value').innerHTML = loudness + ' dB'; 
                set_fader_level(scale(loudness*(-1), 0,15, 0,100));
                prev_value = null;               
            break;

            case 'H' :
                document.getElementById('db_value').innerHTML = bass + ' dB'; 
                set_fader_level(scale(bass, -15,15, 0,100));
                prev_value = null;
            break;

            case 'J' :
                document.getElementById('db_value').innerHTML = middle + ' dB'; 
                set_fader_level(scale(middle, -15,15, 0,100));
                prev_value = null;
            break;

            case 'L' :
                document.getElementById('db_value').innerHTML = treble + ' dB'; 
                set_fader_level(scale(treble, -15,15, 0,100));
                prev_value = null;
            break;

            case 'N' :
                document.getElementById('db_value').innerHTML = subwoofer + ' dB'; 
                set_fader_level(scale(subwoofer, -79,15, 0,100));
                prev_value = null;
            break;
        }
    }
}

function set_fader_level(value)
{
    document.getElementById('slider').value = value;
    document.getElementById('fader_knob').style.bottom = value * (174/100) + 'px';
}

function slider_handler()
{
    let socket_data = 'none';

    if(knob_active != 'none')
    {
        let value = document.getElementById('slider').value;
        let fader_point = value * (174/100);

        document.getElementById('fader_knob').style.bottom = fader_point + 'px';

        switch(knob_active)
        {
            case 'B' : 
                gain = scale(value, 0,100, 0,15);
                document.getElementById('db_value').innerHTML = gain + ' dB';
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(gain, 0,15, 0,270) + 'deg)';
                socket_data = gain;
            break;

            case 'C' :
                volume = scale(value, 0,100, -79,15);
                document.getElementById('db_value').innerHTML = volume + ' dB';
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(volume, -79,15, 0,270) + 'deg)';
                socket_data = volume;
            break;

            case 'D' :
                balance = scale(value, 0,100, -79,79);
                document.getElementById('db_value').innerHTML = balance;
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(balance, -79,79, 0,270) + 'deg)'; 
                socket_data = balance;
            break;

            case 'E' :
                high_self = scale(value, 0,100, 0,11) * 2;
                document.getElementById('db_value').innerHTML = high_self + ' dB';
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(high_self, 0,22, 0,270) + 'deg)';        
                socket_data = high_self.toFixed();
            break;

            case 'F' :
                loudness = scale(value, 0,100, 0,15) * (-1);
                document.getElementById('db_value').innerHTML = loudness + ' dB';
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(loudness*(-1), 0,15, 0,270) + 'deg)'; 
                socket_data = loudness.toFixed();
            break;

            case 'H' :
                bass = scale(value, 0,100, -15,15);
                document.getElementById('db_value').innerHTML = bass + ' dB';
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(bass, -15,15, 0,270) + 'deg)'; 
                socket_data = bass;
            break;

            case 'J' :
                middle = scale(value, 0,100, -15,15);
                document.getElementById('db_value').innerHTML = middle + ' dB';
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(middle, -15,15, 0,270) + 'deg)';  
                socket_data = middle;
            break;

            case 'L' :
                treble = scale(value, 0,100, -15,15);
                document.getElementById('db_value').innerHTML = treble + ' dB';
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(treble, -15,15, 0,270) + 'deg)'; 
                socket_data = treble;
            break;
            
            case 'N' :
                subwoofer = scale(value, 0,100, -79,15);
                document.getElementById('db_value').innerHTML = subwoofer + ' dB';
                document.getElementById(knob_active).style.transform = 'rotate(' + scale(subwoofer, -79,15, 0,270) + 'deg)';
                socket_data = subwoofer;
            break;
        }

        if(socket_data != prev_value)
        {         
            let len = socket_data.length;
            socket.send(knob_active + len + socket_data);
            prev_value = socket_data;
        } 
    } 
}
