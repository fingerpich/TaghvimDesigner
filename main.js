(function(){
    $(document).ready(function(){
        setTimeout(function(){modalWindow("#set_paperSize_Div","#set_paperSize_Div a");},500);

        $('.colpick').jPicker(
            {
            window:{expandable: true,title:"برای تغییر رنگ مکان نشانه ها رو تغییر ده"}
            ,color:{alphaSupport: true,active: new $.jPicker.Color({ ahex: '99330099' })}
            ,images:{clientPath: 'Helpers/images/'}// Path to image files
        }
            ,function(){}//commit callback
            ,function(color,context){
                if(active_Item)
                {
                    var method=(active_Item.toltype=="line"?"stroke":"fill")+"Color";
                    active_Item[method]="#"+(color.val('hex')||"fff");
                }
            }//live change callback
            ,function(){}//cancel callback
        );

        $('#paper_size').on('change', function (e) {
            var optionSelected = $("option:selected", this);
            var t=optionSelected.attr("size").split(",");
            var texts=$("#set_paperSize_Div :text");
            $(texts[0]).val(t[0]);
            $(texts[1]).val(t[1]);
        });
        $('#startDesignBtn').on('click',function(e){
            var texts=$("#set_paperSize_Div :text");
            var width=$(texts[0]).val();
            var height=$(texts[1]).val();
            var c=document.getElementById("canvasElement");
            c.width=width;
            c.height=height;
            $("#container").width(parseInt(width)+400);
            $("#modalwinDiv").fadeOut(200);
            $("#set_paperSize_Div").css({ 'display' : 'none' });

            paper.setup("canvasElement");
        });

        $(window).resize(function(){
            $("#status_bar").css("bottom","0px");
            $("#status_bar").css("width",$(document).width());
        });
        $(window).resize();

        //===============initialize Paper framework===============
        paper.setup("canvasElement");
        paper.install(window);

        //========================================================
        //===================implement Tools======================
        //========================================================
        var tools={};
        var tolbotons=$(".tool button");
        for(var i=0;i<tolbotons.length;i++) {
            var t=$(tolbotons[i]).text();
            tools[t]=new Tool();
            tools[t].onMouseMove=function(event){
                set_status(event.point.toString());
            }
        }
        var active_Item;
        function set_status(status_text){
            $("#status_bar").html(status_text);
        }
        tools.pointer.onMouseDown=function(event){
            active_Item=[];
            var childs=project.activeLayer.children;
            for(var i=0;i<childs.length;i++){
                if(childs[i].selected=childs[i].contains(event.point))active_Item.push(childs[i]);
            }
            $("#PropertiesDiv > div").hide();
            if(active_Item.length==1){
                active_Item=active_Item[0];
                if(active_Item.toltype){
                    var prop_div_id="#"+active_Item.toltype+"Properties";
                    $(prop_div_id).fadeIn(300);
                    if(active_Item.toltype=="text")
                        $("#typographic_text").val(active_Item.content);
                    $(prop_div_id+" .colpick")[0].color.active.val('hex', active_Item.fillColor.toCSS(true), this);
                }
//                if(sel.content){
//                    textpath=sel;
//                    $("#textProperties").fadeIn(300);
//                }
            }
        }
        tools.pointer.onMouseDrag=function(event){
            var a=active_Item[0]?active_Item:[active_Item];
            $.each(a,function(index,item){item.translate(event.delta)});
            set_status("Translate x:"+(event.point.x-event.downPoint.x)+" y:"+(event.point.y-event.downPoint.y));
        }

        tools.rotate.onMouseDown=function(event){
            active_Item=[];
            var childs=project.activeLayer.children;
            for(var i=0;i<childs.length;i++){
                if(childs[i].selected=childs[i].contains(event.point))
                {
                    active_Item.push(childs[i]);
                    childs[i].angle=0;
                }
            }
            $("#PropertiesDiv > div").hide();
        }
        tools.rotate.onMouseDrag=function(event){
            var a=active_Item[0]?active_Item:[active_Item];
            $.each(a,function(index,item){
                var r=event.point.subtract(event.downPoint).angle-item.angle;
                item.angle+=r;
                item.rotate(r);
            });
            set_status("Rotate "+Math.round(a[0].angle)+" degree");
        }

        tools.scale.onMouseDown=function(event){
            active_Item=[];
            var childs=project.activeLayer.children;
            for(var i=0;i<childs.length;i++){
                if(childs[i].selected=childs[i].contains(event.point))
                {
                    active_Item.push(childs[i]);
                    childs[i].scllen=childs[i].scllen||0;
                }
            }
            $("#PropertiesDiv > div").hide();
        }
        tools.scale.onMouseDrag=function(event){
            var a=active_Item[0]?active_Item:[active_Item];
            var s=(event.point.subtract(event.downPoint).length-50);
            var sc=1+(s-a[0].scllen)/100;
            $.each(a,function(index,item){
                item.scllen=s;
                item.scale(sc);
            });
            set_status("Scale "+round2(a[0].scllen/100+1) +"X");
        }
        function round2(original){
            return Math.round(original*100)/100
        }
        tools.rect.onMouseDown=function(event){
            active_Item = new Path.Rectangle( new Rectangle(event.downPoint, event.point));
            active_Item.toltype='rect';
            active_Item.fillColor ="#"+$("#rectProperties .colpick")[0].color.active.val('hex')||"000";
        }
        tools.rect.onMouseDrag=function(event){
            active_Item.segments[1].point = {x:active_Item.segments[0].point.x, y:event.point.y}
            active_Item.segments[2].point = event.point;
            active_Item.segments[3].point = {x:event.point.x,y:active_Item.segments[0].point.y}
            set_status("draw rectangle from "+event.downPoint.toString()+" width:"+(event.point.x-event.downPoint.x)+" height:"+(event.point.y-event.downPoint.y));
        }

        tools.line.onMouseDown=function(event){
            active_Item = new Path();
            active_Item.toltype='line';
            active_Item.strokeColor ="#"+$("#lineProperties .colpick")[0].color.active.val('hex')||"000";

            active_Item.add(event.point);
            active_Item.add(event.point);
        }
        tools.line.onMouseDrag=function(event){
            active_Item.segments[1].point=event.point;
            $("#lp").val(event.downPoint.x+","+event.downPoint.y+","+event.point.x+","+event.point.y);
            set_status("draw line from: "+event.downPoint.toString()+" to:"+event.point.toString());
        }

        $("#typographic_text").keyup(function(){
            active_Item.content=$("#typographic_text").val();
            view.draw();
        });
        tools.text.onMouseDown=function(event){
            active_Item = new PointText(event.point);
            active_Item.toltype='text';
            active_Item.fillColor ="#"+$("#textProperties .colpick")[0].color.active.val('hex')||"000";
            active_Item.content = 'kabab ba goje';
            $("#typographic_text").val(active_Item.content);

            active_Item.angle=0;
            active_Item.scllen=0;
        }
        tools.text.onMouseDrag=function(event){
            var s=(event.point.subtract(event.downPoint).length-50);
            var r=event.point.subtract(event.downPoint).angle-active_Item.angle;
            var sc=1+(s-active_Item.scllen)/100;
            active_Item.scllen=s;
            active_Item.angle+=r;
            active_Item.rotate(r);
            active_Item.scale(sc);
            set_status("draw image at "+event.downPoint.toString()+" rotate:"+Math.round(active_Item.angle)+"degree scale:"+round2(active_Item.scllen/100+1)+"X");
        }

        var thisimage;
        $(':file').change(function(e){
            var img = new Image();
            var reader = new FileReader;
            reader.onload = function(event){
                img.onload = function() {
                    thisimage=img;
                };
                img.src = event.target.result;
            }

            reader.readAsDataURL(e.target.files[0]);
        });
        tools.image.onMouseDown=function(event){
            active_Item = new Raster(thisimage);
            active_Item.toltype='image';
            active_Item.position = event.point;
            active_Item.angle=0;
            active_Item.scllen=0;
            active_Item.selected = true;
        }
        tools.image.onMouseDrag=function(event){
            var s=(event.point.subtract(event.downPoint).length-50);
            var r=event.point.subtract(event.downPoint).angle-active_Item.angle;
            var sc=1+(s-active_Item.scllen)/100;
            active_Item.scllen=s;
            active_Item.angle+=r;
            active_Item.rotate(r);
            active_Item.scale(sc);
            set_status("draw image at "+event.downPoint.toString()+" rotate:"+Math.round(active_Item.angle)+"degree scale:"+round2(active_Item.scllen/100+1));
        }

        tools.month.onMouseDown=function(){

        }
        tools.month.onMouseDrag=function(event){

        }

        tools.holiday.onMouseDown=function(){

        }
        tools.holiday.onMouseDrag=function(event){

        }



        $(".tool button").on('click',function(event){
            var identifier=$(event.target).text();
            $(".tool button").removeClass("toolActivate");
            $(event.target).addClass("toolActivate");
            tools[identifier].activate();
            if(identifier=="image"){
                $(':file')[0].click();
            }
            $("#PropertiesDiv > div").hide();
            $("#"+identifier+"Properties").fadeIn(300);
        });
        $("#resetbtn").click(function(event){
            modalWindow("#set_paperSize_Div","#set_paperSize_Div a");
        })
        $("#savebtn").click(function(event){
            var childs=project.activeLayer.children;
            var serialize="";
            for(var i=0;i<childs.length;i++){
                serialize+="["+childs[i].toltype+";"+childs[i].position+";"+childs[i].bounds+"]";
            }
            alert(serialize);
        });
        $("button:contains(rect)").trigger('click');
    });
    function modalWindow(content_id,closeButton) {
        var overlay = $("<div id='modalwinDiv'></div>");
        $("body").append(overlay);
        $("#modalwinDiv").click(function() {
            close_modal();
        });
        $(closeButton).click(function() {
            close_modal();
        });
        var modal_height = $(content_id).outerHeight();
        var modal_width = $(content_id).outerWidth();
        $('#modalwinDiv').css({ 'display' : 'block', opacity : 0 });
        $('#modalwinDiv').fadeTo(200,0.5);

        $(content_id).css({
            'display' : 'block','position' : 'fixed',
            'opacity' : 0,'z-index': 11000,'left' : 50 + '%',
            'margin-left' : -(modal_width/2) + "px",
            'top' : 100 + "px"
        });

        $(content_id).fadeTo(200,1);
        function close_modal(){
            $("#modalwinDiv").fadeOut(200);
            $(content_id).css({ 'display' : 'none' });

        }
    }

})();
