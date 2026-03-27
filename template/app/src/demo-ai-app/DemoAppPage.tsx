import { Trash2 } from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import { type Task } from "wasp/entities";
import {
  createTask,
  deleteTask,
  getAllTasksByUser,
  updateTask,
  useQuery,
} from "wasp/client/operations";
import { Button } from "../client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import { Checkbox } from "../client/components/ui/checkbox";
import { Input } from "../client/components/ui/input";
import { cn } from "../client/utils";

export default function DemoAppPage() {
  const [description, setDescription] = useState<string>("");
  const { data: tasks, isLoading: isTasksLoading } = useQuery(getAllTasksByUser);

  const summary = useMemo(() => {
    const allTasks = tasks ?? [];
    const completedTasks = allTasks.filter((task) => task.isDone).length;
    const pendingTasks = allTasks.length - completedTasks;
    const plannedHours = allTasks.reduce((total, task) => {
      const hours = Number(task.time);
      return total + (Number.isFinite(hours) ? hours : 0);
    }, 0);

    return {
      totalTasks: allTasks.length,
      completedTasks,
      pendingTasks,
      plannedHours,
    };
  }, [tasks]);

  const handleSubmit = async () => {
    try {
      await createTask({ description });
      setDescription("");
    } catch (err: any) {
      window.alert("Error: " + (err.message || "Something went wrong"));
    }
  };

  return (
    <div className="flex flex-col justify-center gap-10">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Personal Planner
        </h2>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8">
          Una base sencilla para practicar tu primera web app: autenticación, CRUD
          de tareas, estado completado y una interfaz bonita sobre la que luego
          podemos construir algo más ambicioso.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total tareas" value={summary.totalTasks.toString()} />
        <SummaryCard label="Pendientes" value={summary.pendingTasks.toString()} />
        <SummaryCard label="Completadas" value={summary.completedTasks.toString()} />
        <SummaryCard
          label="Horas planificadas"
          value={`${summary.plannedHours.toFixed(1)}h`}
        />
      </div>

      <Card className="bg-muted/10">
        <CardContent className="space-y-4 px-6 py-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              id="description"
              className="flex-1"
              placeholder="Escribe una tarea, por ejemplo: preparar landing, diseñar logo..."
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleSubmit();
                }
              }}
            />
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!description.trim()}
            >
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-full space-y-4">
        {isTasksLoading && <div className="text-muted-foreground">Loading...</div>}
        {tasks && tasks.length > 0 ? (
          tasks.map((task: Task) => (
            <Todo
              key={task.id}
              id={task.id}
              isDone={task.isDone}
              description={task.description}
              time={task.time}
            />
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="text-muted-foreground py-10 text-center">
              Todavía no hay tareas. Empieza con una mini idea de producto y ve
              construyéndola paso a paso.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

type TodoProps = Pick<Task, "id" | "isDone" | "description" | "time">;

function Todo({ id, isDone, description, time }: TodoProps) {
  const handleCheckboxChange = async (checked: boolean) => {
    await updateTask({
      id,
      isDone: checked,
    });
  };

  const handleTimeChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await updateTask({
      id,
      time: e.currentTarget.value,
    });
  };

  const handleDeleteClick = async () => {
    await deleteTask({ id });
  };

  return (
    <Card className="p-4">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-3">
          <Checkbox
            checked={isDone}
            onCheckedChange={handleCheckboxChange}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span
            className={cn("text-foreground", {
              "text-muted-foreground line-through": isDone,
            })}
          >
            {description}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Input
            id={`time-${id}`}
            type="number"
            min={0.5}
            step={0.5}
            className={cn("h-8 w-20 text-center text-xs", {
              "pointer-events-none opacity-50": isDone,
            })}
            value={time}
            onChange={handleTimeChange}
          />
          <span className="text-muted-foreground text-xs italic">hrs</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            title="Remove task"
            className="text-destructive hover:text-destructive/80 h-auto p-1"
          >
            <Trash2 size="20" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
