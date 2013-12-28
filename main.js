(function(){
    window.onload = function() {
        paper.setup("canvasElement");
        paper.install(window);
        var tools={};
        var tolbotons=$(".tool button");
        for(var i=0;i<tolbotons.length;i++) tools[$(tolbotons[i]).text()]=new Tool();

        var rectpath;
        tools.rect.onMouseDown=function(event){
            var rectangle = new Rectangle(event.downPoint, event.point);
            rectpath = new Path.Rectangle(rectangle);
            rectpath.fillColor = '#e9e9ff';
            rectpath.selected = true;
        }
        tools.rect.onMouseDrag=function(event){
            rectpath.segments[1].point = {x:rectpath.segments[0].point.x, y:event.point.y}
            rectpath.segments[2].point = event.point;
            rectpath.segments[3].point = {x:event.point.x,y:rectpath.segments[0].point.y}
        }

        var linePath;
        tools.line.onMouseDown=function(event){
            linePath = new Path();
            linePath.strokeColor = 'black';
            linePath.add(event.point);
            linePath.add(event.point);
            rectpath.selected = true;
        }
        tools.line.onMouseDrag=function(event){
            linePath.segments[1].point=event.point;
        }
        var textpath;
        tools.text.onMouseDown=function(event){
            textpath = new PointText(event.point);
            textpath.fillColor = 'red';
            textpath.content = 'kabab ba goje';
            $(":text").val(textpath.content);
            $(":input").keyup(function(){
                textpath.content=$(":text").val();
                view.draw();
            });
            textpath.angle=0;
            textpath.length=0;
        }
        tools.text.onMouseDrag=function(event){
            var s=(event.point.subtract(event.downPoint).length-50);
            var r=event.point.subtract(event.downPoint).angle-textpath.angle;
            var sc=1+(s-textpath.length)/100;
            textpath.length=s;
            textpath.angle+=r;
            textpath.rotate(r);
            textpath.scale(sc);
        }

        var thisimage;
        var imageraster;
        tools.image.onMouseDown=function(event){
            imageraster = new Raster(thisimage);
            imageraster.position = event.point;
            imageraster.angle=0;
            imageraster.length=0;
        }
        tools.image.onMouseDrag=function(event){
            var s=(event.point.subtract(event.downPoint).length-50);
            var r=event.point.subtract(event.downPoint).angle-imageraster.angle;
            var sc=1+(s-imageraster.length)/100;
            imageraster.length=s;
            imageraster.angle+=r;
            imageraster.rotate(r);
            imageraster.scale(sc);
        }

        tools.month.onMouseDown=function(){

        }
        tools.month.onMouseDrag=function(event){

        }

        tools.holiday.onMouseDown=function(){

        }
        tools.holiday.onMouseDrag=function(event){

        }

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
        $(".tool button").click(function(event){
            $(".tool button").removeClass("toolActivate");
            $(event.target).addClass("toolActivate");
            tools[$(event.target).text()].activate();
            if($(event.target).text()=="image"){
                $(':file')[0].click();
            }
        });
    }
})();