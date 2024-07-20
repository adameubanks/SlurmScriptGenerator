var ScriptGen = function(div) {
	this.values = {};
	this.inputs = {};
	this.settings = {
		gres: {},
		partitions : {},
		constraint : {}, 
	};
	return this;
};

ScriptGen.prototype.newElement = function(type, args) {
	var newEl = document.createElement("input");
	var tthis = this;
	switch(type) {
		case "checkbox":
			newEl.type = "checkbox";
			newEl.id = args.id;
			if(args.checked) newEl.checked = true;
			break;
		case "radio":
			newEl.type = "radio";
			if(args.name) newEl.name = args.name;
			if(args.checked) newEl.checked = true;
			if(args.value) newEl.value = args.value;
			break;
		case "text":
			newEl.type = "text";
			if(args.size) newEl.size = args.size;
			if(args.maxLength) newEl.maxLength = args.maxLength;
			if(args.value) newEl.value = args.value;
			if(args.type) newEl.type = args.type
			if(args.class)newEl.className = args.class;
			if(args.id)newEl.id = args.id;
			if(args.name) newEl.name = args.name;
			break;
		default:
			newEl.type = "text";
	}

	newEl.onclick = newEl.onchange = function () {
		tthis.updateJobscript();
	};

	return newEl;
}

ScriptGen.prototype.newSelect = function(args) {
	var tthis = this;
	var newEl = document.createElement("select");
	newEl.id = args.id;
	if(args.options) {
		for(var i in args.options) {
			var newOpt = document.createElement("option");
			newOpt.value = args.options[i][0];
			newOpt.text = args.options[i][1];
			if(args.selected && args.selected == args.options[i][0])
				newOpt.selected = true;
			newEl.appendChild(newOpt);
		}
	}

	newEl.onclick = newEl.onchange = function () {
		tthis.updateJobscript();
	};

	return newEl;
}

ScriptGen.prototype.newSpan = function() {
	var newEl = document.createElement("span");
	if(arguments[0]) newEl.id = arguments[0];

	for (var i = 1; i < arguments.length; i++) {
		if(typeof arguments[i] == "string") {
			newEl.appendChild(document.createTextNode(arguments[i]));
		} else {
			newEl.appendChild(arguments[i]);
		}
	}

	return newEl;
};

ScriptGen.prototype.createLabelInputPair = function(labelText, inputElement) {
	var div = document.createElement("div");
	div.className = "input-pair";
	div.id = labelText.slice(0, -2);
	inputElement.id = div.id;
	var label = document.createElement("label");
	label.className = "input-label";
	label.htmlFor = div.id;
	label.innerHTML = labelText;
	div.appendChild(label);
	div.appendChild(inputElement);

	return div;
};

ScriptGen.prototype.createForm = function(doc) {
	form = document.createElement("form");

	// Job name
	this.inputs.job_name = this.newElement("text", {});
	form.appendChild(this.createLabelInputPair("Job name (optional): ", this.inputs.job_name));

	// Allocation name
	this.inputs.group_name = this.newElement("text", {value: "MyGroup"});
	form.appendChild(this.createLabelInputPair("Allocation name (required): ", this.inputs.group_name));

	// Partitions section
	this.inputs.partitions = [];
	var partitions_span = this.newSpan("input_partitions");
	var radioGroupName = "partitionOptions";
	for (var i in this.settings.partitions.names) {
		var new_radio = this.newElement("radio", {
			name: radioGroupName,
			checked: i == 0 ? true : false,
			value: this.settings.partitions.names[i]
		});
		new_radio.partition_name = this.settings.partitions.names[i];
		this.inputs.partitions.push(new_radio);
		var partition_container = this.newSpan(null);
		partition_container.className = "input_partition_container";
		var name_span = this.newSpan(null, this.settings.partitions.names[i]);
		name_span.className = "input_partition_name";
		partition_container.appendChild(new_radio);
		partition_container.appendChild(name_span);
		partitions_span.appendChild(partition_container);
	}
	form.appendChild(this.createLabelInputPair("Partitions<sup><a href='https://www.rc.virginia.edu/userinfo/hpc/overview/#job-queues' target='_blank'>[?]</a></sup>: ", partitions_span));

	// GRES
	this.inputs.gres = [];
	var gres_span = this.newSpan("input_gres");
	gres_span.style.display = "inline-flex";
	gres_span.style.margin = "0px";
	var gres_label = this.createLabelInputPair("GRES: ", gres_span);
	gres_label.style.display = "none";
	var gresRadioGroupName = "gresOptions";
	for (var i in this.settings.gres.names){
		var new_radio = this.newElement("radio", {
			name: gresRadioGroupName,
			checked: false,
			value: this.settings.gres.names[i]
		});
		new_radio.gres_name = this.settings.gres.names[i];
		this.inputs.gres.push(new_radio);
		var gres_container = this.newSpan(null);
		gres_container.className = "input_gres_container";
		var name_span = this.newSpan(null, this.settings.gres.names[i]);
		name_span.className = "input_gres_name";
		gres_container.appendChild(new_radio);
		gres_container.appendChild(name_span);
		gres_span.appendChild(gres_container);
	}
	form.appendChild(gres_label);

	// Constraint
	this.inputs.constraint = [];
	var constraint_span = this.newSpan("input_constraint");
	var constraint_label = this.createLabelInputPair("Constraint: ", constraint_span);
	constraint_label.style.display = "none";
	var constraintRadioGroupName = "constraintOptions";
	for (var i in this.settings.constraints.names){
		var new_radio = this.newElement("radio", {
			name: constraintRadioGroupName,
			checked: false,
			value: this.settings.constraints.names[i]
		});
		new_radio.constraint_name = this.settings.constraints.names[i];
		this.inputs.constraint.push(new_radio);
		var constraint_container = this.newSpan(null);
		constraint_container.className = "input_constraint_container";
		var name_span = this.newSpan(null, this.settings.constraints.names[i]);
		name_span.className = "input_constraint_name";
		constraint_container.appendChild(new_radio);
		constraint_container.appendChild(name_span);
		constraint_span.appendChild(constraint_container);
	}
	form.appendChild(constraint_label);

	// Number of Nodes
	this.inputs.num_nodes = this.newElement("text", {type: "number", value: 1, min: 1, class: "input_nodes"});
	form.appendChild(this.createLabelInputPair("Number of nodes: ", this.inputs.num_nodes));

	// Tasks per Node
	this.inputs.tasks_per_node = this.newElement("text", {type: "number", value: 1, min: 1, class: "input_tasks"});
	form.appendChild(this.createLabelInputPair("Tasks per node: ", this.inputs.tasks_per_node));

	// Number of CPUs
	this.inputs.cpus_per_task = this.newElement("text", {type: "number", value: 1, min: 1, class: "input_cpus"});
	form.appendChild(this.createLabelInputPair("CPUs (cores) per task: ", this.inputs.cpus_per_task));

	// Number of GPUs
	this.inputs.num_gpus = this.newElement("text", {type: "number", value: 0, size: 4, class: "input_gpus"});
	var gpu_label = this.createLabelInputPair("GPUs per node: ", this.inputs.num_gpus);
	gpu_label.style.display = "none";
	form.appendChild(gpu_label);	

	// Memory per processor core
	this.inputs.mem_per_core = this.newElement("text", {type: "number", value: 1, size: 6, class: "input_mem", id: "mem_per_core"});
	this.inputs.mem_units = this.newSelect({id: "mem_units", options: [["GB", "GB"], ["MB", "MB"]]});
	form.appendChild(this.createLabelInputPair("Total Memory: ", this.newSpan("total_mem", this.inputs.mem_per_core, this.inputs.mem_units)));

	// Walltime
	this.inputs.wallhours = this.newElement("text", {value: "1", size: 2, maxLength: 2, id: "wallhours"});
	this.inputs.wallmins = this.newElement("text", {value: "00", size: 2, maxLength: 2, id: "wallmins"});
	form.appendChild(this.createLabelInputPair("Job Time Limit: ", this.newSpan("job_time_limit", this.inputs.wallhours, " hours ", this.inputs.wallmins, " mins ")));

	// Requeueable
	this.inputs.requeue = this.newElement("checkbox", {checked: 1});
	form.appendChild(this.createLabelInputPair("Job is requeueable: ", this.inputs.requeue));

	// Email
	this.inputs.email_begin = this.newElement("checkbox", {id: "begin", checked: 0});
	this.inputs.email_end = this.newElement("checkbox", {id: "end", checked: 0});
	this.inputs.email_abort = this.newElement("checkbox", {id: "abort", checked: 0});
	this.inputs.email_address = this.newElement("text", {value: ""});
	form.appendChild(this.createLabelInputPair("Receive email for job events: ", this.newSpan(null, this.inputs.email_begin, " begin ", this.inputs.email_end, " end ", this.inputs.email_abort, " abort")));
	form.appendChild(this.createLabelInputPair("Email address: ", this.inputs.email_address));

	// Cluster
	this.inputs.cluster = this.newSelect({id: "cluster_select", options: [["Default", "Default"], ["Rivanna", "Rivanna"], ["Afton", "Afton"]]});
	form.appendChild(this.createLabelInputPair("Cluster: ", this.newSpan(null, this.inputs.cluster)));

	// Other slurm options
	this.inputs.other_options = this.newElement("checkbox", {id: "other_options", checked: 0});
	form.appendChild(this.createLabelInputPair("Show additional SLURM options: ", this.inputs.other_options));

	// Custom Command
	this.inputs.custom_command = this.newElement("text", {type: "text", value: "", name: "custom_command"});
	form.appendChild(this.createLabelInputPair("Custom Command: ", this.inputs.custom_command));
	
	return form;
};

ScriptGen.prototype.updateVisibility = function(event){	
	// update custom command visibility
	var customCommand = document.getElementById("Custom Command");
	var showCustomCommand = this.inputs.other_options.checked;
	customCommand.style.display = showCustomCommand ? 'block' : 'none';

	// update gres, cluster, and number of gpus visibility
  var partitions = document.querySelectorAll(".input_partition_container input[type='radio']");
  var gresSection = document.getElementById("GRES");
	var gpuSection = document.getElementById("GPUs per node");
	var clusterSection = document.getElementById("Cluster");
  var checkedPartition = Array.from(partitions).find(radio => radio.checked).value;
  var showGPU = checkedPartition && (checkedPartition === 'gpu' || checkedPartition === 'interactive');
	
  gresSection.style.display = showGPU ? 'inline-flex' : 'none';
  gpuSection.style.display = showGPU ? 'block' : 'none';

	var numGPUsInputs = document.getElementsByClassName("input_gpus")[0];
	showCluster = checkedPartition && (checkedPartition === 'standard' || (checkedPartition === 'interactive' && numGPUsInputs.value == 0));
	clusterSection.style.display = showCluster ? 'block' : 'none';

	// update constraint visibility
	var gres = document.querySelectorAll(".input_gres_container input[type='radio']");
	var gresContainers = document.getElementsByClassName("input_gres_container");
  var constraintSection = document.getElementById("Constraint");
  
	var checkedGRESRadio = Array.from(gres).find(radio => radio.checked);
  var checkedGRES = checkedGRESRadio ? checkedGRESRadio.value : null;
  var showConstraint = checkedGRES && checkedGRES === 'a100';

  constraintSection.style.display = (showConstraint && showGPU) ? 'block' : 'none';
  
	// Show valid gres values based on partition
  Array.from(gresContainers).forEach((container, index) => {
    if (checkedPartition === 'interactive') {
      container.style.display = index < 2 ? 'block' : 'none';
    } else if (checkedPartition === 'gpu') {
      container.style.display = index >= 2 ? 'block' : 'none';
    }
  });

	// set defaults for num gpu, cluster, custom command
	if (!showGPU) {
		numGPUsInputs.value = 0;
	}
	if (!showCluster) {
		var clusterSelect = document.getElementById("cluster_select");
		clusterSelect.value = "Default";
	}
	if (!showCustomCommand) {
		var customCommandInput = document.getElementsByName("custom_command")[0];
		customCommandInput.value = "";
	}

	// deselect constraint radios when constraint is hidden
	if (!showConstraint) {
		var constraintRadios = document.querySelectorAll(".input_constraint_container input[type='radio']");
		constraintRadios.forEach(radio => {
			radio.checked = false;
		});
	}

	// deselect radios when partition is changed
	const allRadios = document.querySelectorAll("input[type='radio']");
	allRadios.forEach(radio => {
		const isHidden = radio.style.display === 'none' || radio.parentElement.style.display === 'none';
		if (isHidden) {
			radio.checked = false;
		}
	});

	var numTasksInputs = document.getElementsByClassName("input_tasks")[0];
	var numNodesInputs = document.getElementsByClassName("input_nodes")[0];
	var numGPUsInputs = document.getElementsByClassName("input_gpus")[0];
	var clusterSelect = document.getElementById("cluster_select");

	// set default values on partition change
	switch (checkedPartition) {
		case "standard":
			numTasksInputs.value = Math.min(numTasksInputs.value, 1000); // Ensure tasks_per_node does not exceed 1000
			numNodesInputs.value = 1; // Set num_nodes to 1 as per standard partition rules
			break;
		case "interactive":
			numTasksInputs.value = Math.min(numTasksInputs.value, 24); // Ensure tasks_per_node does not exceed 24
			numNodesInputs.value = Math.min(numNodesInputs.value, 2); // Ensure num_nodes does not exceed 2
			break;
		case "parallel":
			numTasksInputs.value = Math.min(numTasksInputs.value, 6000); // Ensure tasks_per_node does not exceed 6000
			numNodesInputs.value = Math.max(2, Math.min(numNodesInputs.value, 64)); // Ensure num_nodes is between 2 and 64
			clusterSelect.value = "Default";
			break;
		case "gpu":
			numGPUsInputs.value = Math.min(numGPUsInputs.value, 32); // Ensure gpus does not exceed 32
			numNodesInputs.value = Math.min(numNodesInputs.value, 4); // Ensure num_nodes does not exceed 4
			clusterSelect.value = "Default";
			break;
	}

	// update memory label based on num_nodes
	var memory_label = document.querySelector("label[for='Total Memory']");
	if (numNodesInputs.value == 1) {
			memory_label.textContent = "Total Memory: ";
	} else {
			memory_label.textContent = "Memory Per Core: ";
	}
}

ScriptGen.prototype.retrieveValues = function() {
	this.values.MB_per_core = Math.round(this.inputs.mem_per_core.value * (this.inputs.mem_units.value =="GB" ? 1024 : 1));

	this.values.partitions = [];
	for(var i in this.inputs.partitions) {
		if(this.inputs.partitions[i].checked){
			this.values.partitions.push(this.inputs.partitions[i].partition_name);
		}
	}
	this.values.gres = [];
	for(var i in this.inputs.gres) {
		if(this.inputs.gres[i].checked){
			this.values.gres.push(this.inputs.gres[i].gres_name);
		}
	}
	this.values.constraint = [];
	for(var i in this.inputs.constraint){
		if(this.inputs.constraint[i].checked){
			this.values.constraint.push(this.inputs.constraint[i].constraint_name);
		}
	}

	this.values.num_nodes = this.inputs.num_nodes.value;
	this.values.tasks_per_node = this.inputs.tasks_per_node.value;
	this.values.cpus_per_task = this.inputs.cpus_per_task.value;
	this.values.gpus = this.inputs.num_gpus.value

	this.values.requeue = this.inputs.requeue && this.inputs.requeue.checked;
	this.values.walltime_in_minutes = parseInt(this.inputs.wallhours.value, 10) * 60 + parseInt(this.inputs.wallmins.value, 10);;
	this.values.job_name = this.inputs.job_name.value;
	this.values.group_name = this.inputs.group_name.value;

	this.values.sendemail = {};
	this.values.sendemail.begin = this.inputs.email_begin.checked;
	this.values.sendemail.end = this.inputs.email_end.checked;
	this.values.sendemail.abort = this.inputs.email_abort.checked;
	this.values.email_address = this.inputs.email_address.value;

	this.values.cluster = this.inputs.cluster.options[this.inputs.cluster.selectedIndex].text.toLowerCase();

	this.values.custom_command = this.inputs.custom_command.value;

	// Check if values are valid
	let isValidConfiguration = true;
	this.values.partitions.forEach(partition => {
		switch (partition) {
			case "standard":
				// Check for standard partition constraints
				if (this.values.tasks_per_node > 1000) {
					this.inputs.tasks_per_node.value = 1000;
					showAlert("Maximum Cores (GPU) per User for standard partition exceeded.");
				} else if (this.values.num_nodes != 1) {
					this.inputs.num_nodes.value = 1;
					showAlert("Nodes per Job for standard partition must be 1.");
				} else {
					break;
				}
				isValidConfiguration = false;
				break;
			case "interactive":
				// Check for interactive partition constraints
				if (this.values.tasks_per_node > 24) {
					this.inputs.tasks_per_node.value = 24;
					showAlert("Maximum Cores (GPU) per User for interactive partition exceeded.");
				} else if (this.values.num_nodes > 2) {
					this.inputs.num_nodes.value = 2;
					showAlert("Maximum Nodes per Job for interactive partition is 2.");
				} else if (this.values.gpus > 32) {
					this.inputs.num_gpus.value = 32;
					showAlert("Maximum gres per gpu for interactive partition exceeded.");
				} else {
					break;
				}
				isValidConfiguration = false;
				break;
			case "parallel":
				// Check for parallel partition constraints
				if (this.values.tasks_per_node > 6000) {
					this.inputs.tasks_per_node.value = 6000;
					showAlert("Maximum Cores (GPU) per User for parallel partition exceeded.");
				} else if (this.values.num_nodes < 2 || this.values.num_nodes > 64) {
					this.inputs.num_nodes.value = 2;
					showAlert("Nodes per Job for parallel partition must be between 2 and 64.");
				} else {
					break;
				}
				isValidConfiguration = false;
				break;
			case "gpu":
				// Check for gpu partition constraints
				if (this.values.gpus == 0) {
					this.inputs.num_gpus.value = 1;
				}
				if (this.values.gpus > 32) {
					this.inputs.num_gpus.value = 32;
					showAlert("Maximum gres per gpu for gpu partition exceeded.");
				} else if (this.values.num_nodes > 4) {
					this.inputs.num_nodes.value = 4;
					showAlert("Maximum Nodes per Job for gpu partition is 4.");
				} else {
					break;
				}
				isValidConfiguration = false;
				break;
		}
	});
	if(this.values.walltime_in_minutes > 86400*7){
		this.inputs.wallhours.value = 1
		this.inputs.wallmins.value = 0;
		showAlert("Global maximum walltime is 7 days");
		isValidConfiguration = false;
	}
	if(this.values.group_name == ""){
		this.inputs.group_name.value = "MyGroup";
		isValidConfiguration = false;
		showAlert("Please enter an allocation name");
	}

	return isValidConfiguration;
};

function showAlert(message) {
	const alertContainer = document.getElementById('alert-container');
	const alertHTML = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
			${message}
			<button type="button" class="close" data-dismiss="alert" aria-label="Close">
					<span aria-hidden="true">&times;</span>
			</button>
	</div>`;
	alertContainer.innerHTML += alertHTML;
}

ScriptGen.prototype.generateScriptSLURM = function () {
	var scr = "#!/bin/bash\n\n#Submit this script with: sbatch myjob.slurm\n\n";
	var sbatch = function sbatch(txt) {
		scr += "#SBATCH " + txt + "\n";
	};
	
	sbatch("--time=" + this.inputs.wallhours.value + ":" + this.inputs.wallmins.value + ":00   # job time limit");

	// Add SLURM directives for number of nodes and tasks per node
	sbatch("--nodes="+this.inputs.num_nodes.value+"   # number of nodes");
	sbatch("--ntasks-per-node="+this.inputs.tasks_per_node.value+"   # number of processes per node (i.e. tasks)");
	sbatch("--cpus-per-task="+this.inputs.cpus_per_task.value+"   # number of CPU cores per task");

	if(this.inputs.num_gpus.value > 0) {
		if(this.values.gres.length > 0) {
			var gres = this.values.gres.join(",")
			sbatch("--gres=gpu:" + gres + ":" + this.inputs.num_gpus.value + "   # gpu devices per node");
		} else {
			sbatch("--gres=gpu:" + this.inputs.num_gpus.value + "   # gpu devices per node");
		}
	}

	if(this.values.gres.length > 0) {
		var gres = this.values.gres.join(",")
		if(this.values.constraint.length > 0){
			var constraint = this.values.constraint.join(",")
			sbatch("--constraint=" + gres + "_" + constraint);
		}
	}

	if(this.values.partitions.length > 0) {
		var partitions = this.values.partitions.join(",");
		sbatch("-p " + partitions + "   # partition(s)");
	}

	if (this.inputs.num_nodes.value == 1) {
		sbatch("--mem=" + this.inputs.mem_per_core.value + this.inputs.mem_units.value.substr(0,1) + "   # memory");
	} else {
		sbatch("--mem-per-cpu=" + this.inputs.mem_per_core.value + this.inputs.mem_units.value.substr(0,1) + "   # memory per CPU core");	
	}

	if(this.inputs.job_name.value && this.inputs.job_name.value != "") {
		sbatch("-J \"" + this.inputs.job_name.value + "\"   # job name");
	}
	
	if(this.inputs.email_begin.checked || this.inputs.email_end.checked || this.inputs.email_abort.checked) {
		sbatch("--mail-user=" + this.values.email_address + "   # email address");
		if(this.inputs.email_begin.checked)
			sbatch("--mail-type=BEGIN");
		if(this.inputs.email_end.checked)
			sbatch("--mail-type=END");
		if(this.inputs.email_abort.checked)
			sbatch("--mail-type=FAIL");
	}

	if(!this.inputs.requeue.checked)
		sbatch("--no-requeue   # prevents job returning to queue after node failure");

	if(this.values.cluster != "default") {
		sbatch("--constraint=" + this.values.cluster + "   # cluster");
	}

	if(this.inputs.group_name.value != '') {
		sbatch("--account=" + this.inputs.group_name.value + "   # allocation name");
	}

	if(this.inputs.custom_command.value != '') {
		scr += this.inputs.custom_command.value + "\n";
	}

	scr += "\n\n# LOAD MODULES, INSERT CODE, AND RUN YOUR PROGRAMS HERE\n";
	return scr;
};

ScriptGen.prototype.updateJobscript = function() {
	var isValidConfiguration = this.retrieveValues();
    
	if (!isValidConfiguration) {
		return;
	}

	this.updateSU();
	this.updateVisibility();
	this.toJobScript();
};

ScriptGen.prototype.updateSU = function() {
	var suDiv = document.getElementById("su");

	var suAfton = calculateSU(this.values)[0];
	var suRivanna = calculateSU(this.values)[1];

	var suAftonDiv = document.getElementById("su_afton");
	if(suAftonDiv) {
		if (suAfton == 0 || isNaN(suAfton)) {
			suAftonDiv.style.display = "none";
		} else {
			suAftonDiv.style.display = "block";
			suAftonDiv.textContent = "Service Units (Afton): " + suAfton;
		}
	} else {
		suAftonDiv = document.createElement("div");
		suAftonDiv.id = "su_afton";
		suAftonDiv.textContent = "Service Units (Afton): " + suAfton;
		this.suDiv.appendChild(suAftonDiv);
	}

	var suRivannaDiv = document.getElementById("su_rivanna");
	if(suRivannaDiv) {
		if (suRivanna == 0 || isNaN(suRivanna)) {
			suRivannaDiv.style.display = "none";
		} else {
			suRivannaDiv.style.display = "block";
			suRivannaDiv.textContent = "Service Units (Rivanna): " + suRivanna
		}
	} else {
		suRivannaDiv = document.createElement("div");
		suRivannaDiv.id = "su_rivanna";
		suRivannaDiv.textContent = "Service Units (Rivanna): " + suRivanna;
		this.suDiv.appendChild(suRivannaDiv);
	}
}

function calculateSU(values) {
	var nnode = values.num_nodes;
	var ntask = values.tasks_per_node;
	var ncpu = values.cpus_per_task;
	var tmem = values.MB_per_core / 1024;
	var nhour = values.walltime_in_minutes / 60;
	var ncore = nnode * ntask * ncpu;
  var checkedPartition = Array.from(values.partitions)[0];
	// Rates for Rivanna
	var R_c_Rivanna = 1;
	var R_m_Rivanna = 0.5;

	// Rates for Afton
	var R_c_Afton = 6;
	var R_m_Afton = 1;

	// Calculate SU based on selected partition
	switch (checkedPartition) {
		case "standard":
			var su_R = nhour * (ncore * R_c_Rivanna + tmem * R_m_Rivanna);
			var su_A = nhour * (ncore * R_c_Afton + tmem * R_m_Afton);
			break;
		case "interactive":
			var ngpu = values.gpus;
			if (ngpu > 0) {
				var R_G;
				switch (values.gres[0]) {
					case "RTX2080":
						R_G = 48;
						break;
					case "RTX3090":
						R_G = 65;
						break;
				}
				var ngcore = nnode * ngpu;
				su = nhour * ngcore * R_G;
				su_A = su;
				su_R = su;
			} else {
				// If ngpu is 0, replicate the logic from the default case
				var su_R = nhour * (ncore * R_c_Rivanna + tmem * R_m_Rivanna);
				var su_A = nhour * (ncore * R_c_Afton + tmem * R_m_Afton);
			}
			break;
		case "parallel":
			mcore = tmem;
			totmem = ncore * mcore;
			su_A = nhour * (ncore * R_c_Afton + totmem * R_m_Afton);
			su_R = 0;
			break;
		case "gpu":
			var ngpu = values.gpus;
			var ngcore = nnode * ngpu;
			var R_G;
			switch (values.gres[0]) {
				case "v100":
					R_G = 3;
					break;
				case "a6000":
					R_G = 85;
					break;
				case "a40":
					R_G = 119;
					break;
				case "a100":
					var constraint = values.constraint[0];
					if (constraint == "80gb") {
						R_G = 434;
					}
					else if (constraint == "40gb") {
						R_G = 267;
					}
					break;
				default:
					R_G = 0;
			}
			su_A = nhour * ngcore * R_G;
			su_R = nhour * ngcore * R_G; //NaN;
			break;
		default:
			// Calculate SU for standard partiton by default
			var su_R = nhour * (ncore * R_c_Rivanna + tmem * R_m_Rivanna);
			var su_A = nhour * (ncore * R_c_Afton + tmem * R_m_Afton);
	}
	return [ su_A, su_R ];
}

ScriptGen.prototype.init = function() {
	this.inputDiv = document.getElementById("jobScriptForm");

	this.form = this.createForm();
	this.inputDiv.appendChild(this.form);

	this.suDiv = document.getElementById("su");

	this.jobScriptDiv = document.getElementById("jobScript");
	this.jobScriptDiv.style.position = "relative";

	var copyButton = document.createElement("button");
	copyButton.id = "copyButton";
	copyIcon = document.createElement("i");
	copyIcon.className = "fa fa-copy";
	copyIcon.color = "#454545";
	copyButton.appendChild(copyIcon);
	this.jobScriptDiv.appendChild(copyButton);

	var pre = document.createElement("pre");
	var code = document.createElement("code");
	this.jobScriptDiv.appendChild(pre);
	this.jobScriptDiv.querySelector("pre").appendChild(code);

	this.updateJobscript();
};

ScriptGen.prototype.toJobScript = function() {
	var scr = this.generateScriptSLURM();
	var pre = this.jobScriptDiv.querySelector("pre");
	pre.querySelector("code").textContent = scr;

	// Add copy button
	document.getElementById('copyButton').addEventListener('click', () => {
		var icon = document.querySelector('#copyButton i');
		icon.classList.remove('fa-copy');
		icon.classList.add('fa-check');
		setTimeout(() => {
			icon.classList.remove('fa-check');
			icon.classList.add('fa-copy');
		}, 1000);
		navigator.clipboard.writeText(scr);
	});

	// Remove existing download button if it exists
	var existingDownloadButton = document.getElementById("downloadButton");
	if (existingDownloadButton) {
		this.jobScriptDiv.removeChild(existingDownloadButton);
	}

	// Create a new download button
	var downloadButton = document.createElement("button");
	downloadButton.id = "downloadButton";
	downloadButton.className = "download-button";
	downloadButton.textContent = "Download Script";
	this.jobScriptDiv.appendChild(downloadButton);

	// Add download button
	downloadButton.addEventListener('click', () => {
		const blob = new Blob([scr], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'myjob.slurm';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	});
};

