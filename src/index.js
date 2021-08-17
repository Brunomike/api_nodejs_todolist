const express=require('express');
const bodyParser=require('body-parser');
const path=require('path')
const mysql=require('mysql2');
const port=process.env.PORT||3000;

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'nodejstodo'
})

try {
    connection.connect();
    console.log("Database connected successfully!");
} catch (e) {
    console.log("Database Connection Failed");
    console.log(e);
}

const api=express();
api.use(bodyParser.json());
api.use(express.static(path.join(__dirname+"/public")));

// api.get('/',(req,res)=>{    
//     res.sendFile("index.js");
// })

api.get('/tasks',(req,res)=>{
    connection.query('SELECT * FROM tasks ORDER BY created DESC',(err,results)=>{
        if(err) return res.json({error:err});

        // res.json({
        //     todo:results.filter((item=>!item.completed)),
        //     completed:results.filter((item=>item.completed))
        // });
        res.json(results);
    })
})

api.post('/add',(req,res)=>{    
    let item=req.body.item;
    let addItem=`INSERT INTO tasks (tasks.description) VALUES(?)`;
    connection.query(addItem,[item],(err,results)=>{
        if(err){
            return res.json({error:err});
            //console.log(err);
        }else{
            connection.query('SELECT LAST_INSERT_ID() FROM tasks',(err,result)=>{
                if(err) return res.json({error:err});                                  
                
                res.json({
                    id:result[0]['LAST_INSERT_ID()'],
                    description:item
                });
            })
            
        }
    })    
    
})

api.post('/tasks/:id/update',(req,res)=>{
    let taskId=req.body.itemId;
    let itemStatus=req.body.itemStatus;

    if(itemStatus==="1"){
        connection.query('UPDATE tasks SET completed=? WHERE ID=?',[0,taskId],(err,results)=>{
            if(err) return res.json({error:err});
            //res.json({id:taskId,status:itemStatus});
        })        
        //res.json("Completed");
    }else if(itemStatus==="0"){
        connection.query('UPDATE tasks SET completed=? WHERE ID=?',[1,taskId],(err,results)=>{
            if(err) return res.json({error:err});
            //res.json({id:taskId,status:itemStatus});
        })         
        //res.json("Incomplete");
    }

    

})

api.post('/tasks/:id/remove',(req,res)=>{
    console.log(req.body);
    let taskId=req.body.itemId;
    connection.query('DELETE FROM tasks WHERE ID=?',[taskId],(err,results)=>{
        if(err) return res.json({error:err});
        res.json({ID:taskId,message:"Successfully Removed"});
    })
    
})

api.listen(port,()=>{
    console.log("API up and running...");
})