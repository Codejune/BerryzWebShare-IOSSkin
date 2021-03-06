// BASIC

var highlightColor = "#ccddff";
var shiftPressed = false;

function ie6notsupport() {
	if('\v'=='v' && navigator.appVersion.indexOf('MSIE 6.0') > -1) {
		document.body.style.display = 'none';
		alert('Microsoft Internet Explorer 6.0 는 지원하지 않습니다.');
		document.location.href = 'http://resistan.com/savethedeveloper/';
	}
}

function replaceTitle(objName) {
	var title = document.getElementById(objName);
	if(title.innerHTML.indexOf('주소:') > -1) {
		title.innerHTML = '403 Fobidden';
	}
}

function mouseDown( e )
{
	var evt = (navigator.appName=="Netscape") ? e : event;
	shiftPressed = evt.shiftKey;
	// evt.shiftKey; evt.altKey; evt.ctrlKey;
	return true;
}
document.onmousedown = mouseDown;

function ToggleSelectAll()
{
	var currform = document.getElementById("fileListForm");
	var cbs = currform.elements;
	for( i=0; i < cbs.length; ++i )
	{
		if( cbs[i].name.substr(0, 9) != "checkbox#" )
			continue;
		cbs[i].checked = currform.selectAllCheckbox.checked;
	}

	var table = document.getElementById("fileListTable").getElementsByTagName('tr');
	for( i=0; i < table.length; ++i )
	{
		table[i].className = currform.selectAllCheckbox.checked ? 'selected': '';
	}
}

function HighlightRow( link, checked )
{
	document.getElementById("tr#"+link).className = checked ? 'selected' : '';
}

function onMkdir()
{
	var folderName = prompt("새로 만들 폴더 이름을 입력해 주세요.", "");
	if( folderName )
	{
		document.MkdirForm.name.value=folderName;
		document.MkdirForm.submit();	
	}
}

function OnPlugin( sel )
{
	var pluginType = "view";

	var pluginId = sel.options[sel.selectedIndex].value;
	if( pluginId == "" ) return;

	for( i=sel.selectedIndex+1; i<sel.options.length; ++i )
	{
		if( sel.options[i].value == "" )
		{
			pluginType = "action";
			break;
		}
	}

	var cbs = document.getElementById("fileListForm").elements;
	var selectedFiles = "";
	for( i=0; i<cbs.length; ++i )
	{
		if( cbs[i].name.substr(0, 9) != "checkbox#" )
			continue;

		if( cbs[i].checked )
		{
			selectedFiles += cbs[i].value;
			selectedFiles += "\n";
		}
	}

	if( pluginType == "action" && selectedFiles == "" )
	{
		alert("기능을 적용할 대상을 먼저 선택해 주세요.");
		sel.selectedIndex = 0;
		return;
	}

	var form = document.getElementById("pluginForm");
	form.action = "?action=Plugin&type=" + pluginId;
	form.selectedFiles.value = selectedFiles;

	form.submit();
}


function OnPlugin2( sel )
{
	var pluginType = "view";
	var pluginId = sel;

	var cbs = document.getElementById("fileListForm").elements;
	var selectedFiles = "";
	var selectedCount = 0;
	for( i=0; i<cbs.length; ++i )
	{
		if( cbs[i].name.substr(0, 9) != "checkbox#" )
			continue;

		if( cbs[i].checked )
		{
			selectedCount++;
			selectedFiles += cbs[i].value;
			selectedFiles += "\n";
		}
	}

	if( pluginType == "action" && selectedFiles == "" )
	{
		alert("기능을 적용할 대상을 먼저 선택해 주세요.");
		sel.selectedIndex = 0;
		return;
	}
	
	if( sel == "RARdownload" || sel == "ZIPdownload" || sel == "playlist.asx" || sel == "playlist.m3u" || sel == "Delete" ) {
		if(selectedCount < 1) {
			alert("파일을 선택하세요. ("+selectedCount+")");
			return false;
		}
	} else if(sel == "Rename") {
		if(selectedCount < 1) {
			alert("파일을 선택하세요. ("+selectedCount+")");
			return false;
		} else if( selectedCount > 1) {
			alert("변경할 파일은 하나만 선택가능 합니다.");
			return false;
		}
	}

	var form = document.getElementById("pluginForm");
	form.action = "?action=Plugin&type=" + pluginId;
	form.selectedFiles.value = selectedFiles;

	form.submit();
}

// SUBDIR

function create_request()
{
	var request = false;
	try {
		request = new XMLHttpRequest();
	} catch (trymicrosoft) {
		try {
			request = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (othermicrosoft) {
			try {
				request = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (failed) {
				request = false;
			}  
		}
	}

	if (!request)
		alert("Error initializing XMLHttpRequest!");
	return request;
}

var opens = new Array();

// codes for sub directory viewing
var SUBDIR_close_delay = 650;
var SUBDIR_close_timer_key = null;

function SUBDIR_reset_close_timer()
{
	if (SUBDIR_close_timer_key)
	{
		clearTimeout(SUBDIR_close_timer_key);
		SUBDIR_close_timer_key = null;
	}
}

function SUBDIR_close_all()
{
	SUBDIR_reset_close_timer();
	SUBDIR_close_timer_key = setTimeout(function(){
		while(opens.length > 0)
		{
			var d = opens.pop()
			d.style.visibility = "hidden";
		}
	}, SUBDIR_close_delay);
}

function getRealOffsetTop(o) { return o ? o.offsetTop + getRealOffsetTop(o.offsetParent) : 0; }
function getRealOffsetLeft(o) { return o ? o.offsetLeft + getRealOffsetLeft(o.offsetParent) : 0; }

var cache = new Object;
var level = new Object;

function get_id_from_div(div)
{
	return div.id.substr(1);
}

function insert_opened(div)
{
	var i = 0;
	var l = level[get_id_from_div(div)];
	while (i < opens.length)
	{
		if (level[get_id_from_div(opens[i])] >= l && opens[i] != div)
		{
			opens[i].style.visibility = "hidden";
			opens[i] = opens[opens.length-1];
			opens.pop();
			i--;
		}
		i++;
	}
	opens.push(div);
}

var SUBDIR_menu_delay_key = null;

function SUBDIR_open(path)
{
	var a = document.getElementById("a"+path);
	var div = document.getElementById("d"+path);
	for(var i = 0; i < opens.length; i ++)
		if (opens[i] == div)
			return;
	if (level[get_id_from_div(div)] > 1)
	{
		div.style.left = getRealOffsetLeft(a) + a.offsetWidth + "px";
		div.style.top = getRealOffsetTop(a)-3 + "px";
	}
	else
	{
		div.style.left = getRealOffsetLeft(a) + (a.offsetWidth / 2) + "px";
		div.style.top = getRealOffsetTop(a)+ (a.offsetHeight * 4 / 5) + "px";
	}
	if (SUBDIR_menu_delay_key)
	{
		clearTimeout(SUBDIR_menu_delay_key);
		SUBDIR_menu_delay_key = null;
	}

	SUBDIR_menu_delay_key = setTimeout(function(){
	div.style.visibility = "visible";
	insert_opened(div);
	},250);

	if (cache[path])
		return;
	cache[path] = true;

	var request = create_request();
	request.open("GET", encodeURI(path) + "/?action=Subdir", true);
	request.onreadystatechange = function ()
		{
			if (request.readyState == 4)
			{
				var l = level[path];
				var dirs = eval(request.responseText);
				var output = "";
				if (dirs == 'UNAUTHORIZED')
				{ 
					output = "<i>(권한 없음)</i>";
					dirs = [];
				}
				else if (dirs.length < 2)
				{
					var t = path.split('/');
					t = t[t.length-1];
					output = "<i>(하위 없음)</i>"
				}

				for(var i = 0; i < dirs.length; i ++)
				{
					if (dirs[i] != '/')
					{
						output+= SUBDIR_generate_point(path+"/"+dirs[i], l+1,dirs[i])
					}
				}
				div.innerHTML = output
			}
		}
	request.send(null)

}

function colorme(obj)
{
	obj.style.backgroundColor = highlightColor;
}

function uncolorme(obj)
{
	obj.style.backgroundColor = "";
}

function SUBDIR_generate_point(path, lev, name)
{
	cache[path] = false;
	level[path] = lev;
	var div = document.createElement('div');
	div.id = "d" + path;
	div.style.position = 'absolute';
	div.style.visibility = 'hidden';
	div.style.border = '1px solid #808080';
	div.style.padding="0.5em 0.5em 0.5em 0.5em";
	div.style.backgroundColor = '#FFFFFF';
	div.style.zIndex = 3;
	div.onmouseover = function(){SUBDIR_reset_close_timer()};
	div.onmouseout = function(){if (div.style.visibility == "visible") SUBDIR_close_all();}
	document.body.appendChild(div);
	t = document.createTextNode('(Reading filelist(s)).');
	div.appendChild(t);

	if (lev == 1)
		return "<span id=\"a"+path+"\" class='subdirTop' onmouseover='SUBDIR_open(this.id.substr(1));SUBDIR_reset_close_timer(); colorme(this);' onmouseout = 'SUBDIR_close_all();uncolorme(this);'><a href="+'"'+path+'"'+" >"+name+"</A></span>";
	else
		return "<div id=\"a"+path+"\" class='subdirNode' style='width:inherit' onmouseover='SUBDIR_open(this.id.substr(1)); colorme(this);' onmouseout='uncolorme(this)'><a href="+'"'+path+'"'+" >"+name+"</a></div>";
}

function write_split_address( addr )
{
	var output = ""
	var path = ".";
	if (addr != "/")
	{
		var arr = addr.split('/');
		for(var i = arr.length - 2; i > 0 ; i --)
		{
			output = 
				SUBDIR_generate_point(path ,1,arr[i]+"/") +  
				output;
			path += "/..";
		}
	}
	output = SUBDIR_generate_point(path, 1, "/") + output
	//output = "<span style='font-size: 200%'>주소: </span>" + output + SUBDIR_generate_point(".", 1, "(하위폴더보기)");
	document.getElementById('titleContainer').innerHTML += output;
}
