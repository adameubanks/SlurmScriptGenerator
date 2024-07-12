var UVAScriptGen = function(div) {
	this.values = {};
	this.containerDiv = div;
	this.inputs = {};
	this.settings = {
		gres: {},
		partitions : {},
		constraint : {}, 
	};
	return this;
};

UVAScriptGen.prototype.newCheckbox = function(args) {
	var tthis = this;
	var newEl = document.createElement("input");
	newEl.type = "checkbox";
	if(args.checked) newEl.checked = true;
	
	newEl.onclick = newEl.onchange = function () {
		tthis.updateJobscript();
	};

	return newEl;
}

UVAScriptGen.prototype.newRadio = function(args) {
	var tthis = this;
	var newEl = document.createElement("input");
	newEl.type = "radio";
	if(args.name) newEl.name = args.name;
	if(args.checked) newEl.checked = true;
	if(args.value) newEl.value = args.value;
	
	newEl.onclick = newEl.onchange = function () {
		tthis.updateJobscript();
	};

	return newEl;
}

UVAScriptGen.prototype.newInput = function(args) {
	var tthis = this;
	var newEl = document.createElement("input");
	newEl.type = "text";
	if(args.size) newEl.size = args.size;
	if(args.maxLength) newEl.maxLength = args.maxLength;
	if(args.value) newEl.value = args.value;
	if(args.type) newEl.type = args.type
	if(args.class)newEl.className = args.class;

	newEl.onclick = newEl.onchange = function () {
		tthis.updateJobscript();
	};

	return newEl;
}

UVAScriptGen.prototype.newSelect = function(args) {
	var tthis = this;
	var newEl = document.createElement("select");
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

UVAScriptGen.prototype.newSpan = function() {
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

UVAScriptGen.prototype.createLabelInputPair = function(labelText, inputElement) {
	var div = document.createElement("div");
	div.className = "input-pair";
	div.id = labelText.slice(0, -2);
	inputElement.id = div.id;
	var label = document.createElement("label");
	label.className = "input-label";
	label.htmlFor = div.id;
	label.appendChild(document.createTextNode(labelText));
	div.appendChild(label);
	div.appendChild(inputElement);

	return div;
};

UVAScriptGen.prototype.createForm = function(doc) {
	form = document.createElement("form");

	// Job name
	this.inputs.job_name = this.newInput({});
	form.appendChild(this.createLabelInputPair("Job name (optional): ", this.inputs.job_name));

	// Allocation name
	this.inputs.group_name = this.newInput({value: "MyGroup"});
	form.appendChild(this.createLabelInputPair("Allocation name (required): ", this.inputs.group_name));

	// Partitions section
	this.inputs.partitions = [];
	var partitions_span = this.newSpan("uva_sg_input_partitions");
	var radioGroupName = "partitionOptions";
	for (var i in this.settings.partitions.names) {
		var new_radio = this.newRadio({
			name: radioGroupName,
			checked: i == 0 ? true : false,
			value: this.settings.partitions.names[i]
		});
		new_radio.partition_name = this.settings.partitions.names[i];
		this.inputs.partitions.push(new_radio);
		var partition_container = this.newSpan(null);
		partition_container.className = "uva_sg_input_partition_container";
		var name_span = this.newSpan(null, this.settings.partitions.names[i]);
		name_span.className = "uva_sg_input_partition_name";
		partition_container.appendChild(new_radio);
		partition_container.appendChild(name_span);
		partitions_span.appendChild(partition_container);
	}
	form.appendChild(this.createLabelInputPair("Partitions: ", partitions_span));

	// Number of GPUs
	this.inputs.num_gpus = this.newInput({type: "number", value: 0, size: 4, class: "uva_sg_input_gpus"});
	var gpu_label = this.createLabelInputPair("Number of GPUs: ", this.inputs.num_gpus);
	gpu_label.style.display = "none";
	form.appendChild(gpu_label);

	// GRES
	this.inputs.gres = [];
	var gres_span = this.newSpan("uva_sg_input_gres");
	gres_span.style.display = "inline-flex";
	gres_span.style.margin = "0px";
	var gres_label = this.createLabelInputPair("GRES: ", gres_span);
	gres_label.style.display = "none";
	var gresRadioGroupName = "gresOptions";
	for (var i in this.settings.gres.names){
		var new_radio = this.newRadio({
			name: gresRadioGroupName,
			checked: false,
			value: this.settings.gres.names[i]
		});
		new_radio.gres_name = this.settings.gres.names[i];
		this.inputs.gres.push(new_radio);
		var gres_container = this.newSpan(null);
		gres_container.className = "uva_sg_input_gres_container";
		var name_span = this.newSpan(null, this.settings.gres.names[i]);
		name_span.className = "uva_sg_input_gres_name";
		gres_container.appendChild(new_radio);
		gres_container.appendChild(name_span);
		gres_span.appendChild(gres_container);
	}
	form.appendChild(gres_label);

	// Constraint
	this.inputs.constraint = [];
	var constraint_span = this.newSpan("uva_sg_input_constraint");
	var constraint_label = this.createLabelInputPair("Constraint: ", constraint_span);
	constraint_label.style.display = "none";
	var constraintRadioGroupName = "constraintOptions";
	for (var i in this.settings.constraints.names){
		var new_radio = this.newRadio({
			name: constraintRadioGroupName,
			checked: false,
			value: this.settings.constraints.names[i]
		});
		new_radio.constraint_name = this.settings.constraints.names[i];
		this.inputs.constraint.push(new_radio);
		var constraint_container = this.newSpan(null);
		constraint_container.className = "uva_sg_input_constraint_container";
		var name_span = this.newSpan(null, this.settings.constraints.names[i]);
		name_span.className = "uva_sg_input_constraint_name";
		constraint_container.appendChild(new_radio);
		constraint_container.appendChild(name_span);
		constraint_span.appendChild(constraint_container);
	}
	form.appendChild(constraint_label);

	// Number of Nodes
	this.inputs.num_nodes = this.newInput({type: "number", value: 1, min: 1, class: "uva_sg_input_nodes"});
	form.appendChild(this.createLabelInputPair("Number of nodes: ", this.inputs.num_nodes));

	// Tasks per Node
	this.inputs.tasks_per_node = this.newInput({type: "number", value: 1, min: 1, class: "uva_sg_input_tasks"});
	form.appendChild(this.createLabelInputPair("Tasks per node: ", this.inputs.tasks_per_node));

	// Number of CPUs
	this.inputs.cpus_per_task = this.newInput({type: "number", value: 1, min: 1, class: "uva_sg_input_cpus"});
	form.appendChild(this.createLabelInputPair("CPUs (cores) per task: ", this.inputs.cpus_per_task));

	// Memory per processor core
	this.inputs.mem_per_core = this.newInput({type: "number", value: 1, size: 6, class: "uva_sg_input_mem"});
	this.inputs.mem_units = this.newSelect({options: [["GB", "GB"], ["MB", "MB"]]});
	form.appendChild(this.createLabelInputPair("Total Memory: ", this.newSpan(null, this.inputs.mem_per_core, this.inputs.mem_units)));


	// Walltime
	this.inputs.wallhours = this.newInput({value: "1", size: 3});
	this.inputs.wallmins = this.newInput({value: "00", size: 2, maxLength: 2});
	this.inputs.wallsecs = this.newInput({value: "00", size: 2, maxLength: 2});
	form.appendChild(this.createLabelInputPair("Walltime: ", this.newSpan(null, this.inputs.wallhours, " hours ", this.inputs.wallmins, " mins ", this.inputs.wallsecs, " secs")));

	// Requeueable
	this.inputs.requeue = this.newCheckbox({checked: 1});
	form.appendChild(this.createLabelInputPair("Job is requeueable: ", this.inputs.requeue));

	// Email
	this.inputs.email_begin = this.newCheckbox({checked: 0});
	this.inputs.email_end = this.newCheckbox({checked: 0});
	this.inputs.email_abort = this.newCheckbox({checked: 0});
	this.inputs.email_address = this.newInput({value: ""});
	form.appendChild(this.createLabelInputPair("Receive email for job events: ", this.newSpan(null, this.inputs.email_begin, " begin ", this.inputs.email_end, " end ", this.inputs.email_abort, " abort")));
	form.appendChild(this.createLabelInputPair("Email address: ", this.inputs.email_address));

	return form;
};

function updateVisibility(event){	
	// update gres and number of gpus visibility
  var partitions = document.querySelectorAll(".uva_sg_input_partition_container input[type='radio']");
  var gresSection = document.getElementById("GRES");
	var gpuSection = document.getElementById("Number of GPUs");

  var checkedPartition = Array.from(partitions).find(radio => radio.checked).value;
  var showGPU = checkedPartition && (checkedPartition === 'gpu' || checkedPartition === 'interactive');

  gresSection.style.display = showGPU ? 'inline-flex' : 'none';
  gpuSection.style.display = showGPU ? 'block' : 'none';

	// update constraint visibility
	var gres = document.querySelectorAll(".uva_sg_input_gres_container input[type='radio']");
	var gresContainers = document.getElementsByClassName("uva_sg_input_gres_container");
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

	// set defaults for num gpu
	if (!showGPU) {
		var numGPUsInputs = document.getElementsByClassName("uva_sg_input_gpus")[0];
		numGPUsInputs.value = 0;
	}

	// deselect constraint radios when constraint is hidden
	if (!showConstraint) {
		var constraintRadios = document.querySelectorAll(".uva_sg_input_constraint_container input[type='radio']");
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

	var numTasksInputs = document.getElementsByClassName("uva_sg_input_tasks")[0];
	var numNodesInputs = document.getElementsByClassName("uva_sg_input_nodes")[0];
	var memPerCoreInputs = document.getElementsByClassName("uva_sg_input_mem")[0];
	var numGPUsInputs = document.getElementsByClassName("uva_sg_input_gpus")[0];

	// set default values on partition change
	switch (checkedPartition) {
		case "standard":
			numTasksInputs.value = Math.min(numTasksInputs.value, 1000); // Ensure tasks_per_node does not exceed 1000
			numNodesInputs.value = 1; // Set num_nodes to 1 as per standard partition rules
			memPerCoreInputs.value = Math.min(memPerCoreInputs.value, 9600); // Ensure MB_per_core does not exceed 9600
			break;
		case "interactive":
			numTasksInputs.value = Math.min(numTasksInputs.value, 24); // Ensure tasks_per_node does not exceed 24
			numNodesInputs.value = Math.min(numNodesInputs.value, 2); // Ensure num_nodes does not exceed 2
			memPerCoreInputs.value = Math.min(memPerCoreInputs.value, 9000); // Ensure MB_per_core does not exceed 9000
			break;
		case "parallel":
			numTasksInputs.value = Math.min(numTasksInputs.value, 6000); // Ensure tasks_per_node does not exceed 6000
			numNodesInputs.value = Math.max(2, Math.min(numNodesInputs.value, 64)); // Ensure num_nodes is between 2 and 64
			memPerCoreInputs.value = Math.min(memPerCoreInputs.value, 8000); // Ensure MB_per_core does not exceed 8000
			break;
		case "gpu":
			numGPUsInputs.value = Math.min(numGPUsInputs.value, 32); // Ensure gpus does not exceed 32
			numNodesInputs.value = Math.min(numNodesInputs.value, 4); // Ensure num_nodes does not exceed 4
			memPerCoreInputs.value = Math.min(memPerCoreInputs.value, 32000); // Ensure MB_per_core does not exceed 32000
			break;
	}

	var memory_label = document.querySelector("label[for='Total Memory']");
	if (numNodesInputs.value == 1) {
			memory_label.textContent = "Total Memory";
	} else {
			memory_label.textContent = "Memory Per Core: ";
	}
}

UVAScriptGen.prototype.retrieveValues = function() {
	console.log("Retrieving values");
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
	this.values.walltime_in_minutes = this.inputs.wallhours.value * 3600 + this.inputs.wallmins.value * 60;

	this.values.job_name = this.inputs.job_name.value;
	this.values.group_name = this.inputs.group_name.value;

	this.values.sendemail = {};
	this.values.sendemail.begin = this.inputs.email_begin.checked;
	this.values.sendemail.end = this.inputs.email_end.checked;
	this.values.sendemail.abort = this.inputs.email_abort.checked;
	this.values.email_address = this.inputs.email_address.value;

	// Check if values are valid
	let isValidConfiguration = true;
	this.values.partitions.forEach(partition => {
		switch (partition) {
			case "standard":
				if (this.values.tasks_per_node > 1000) {
					this.inputs.tasks_per_node.value = 1000;
					showAlert("Maximum Cores (GPU) per User for standard partition exceeded.");
				} else if (this.values.num_nodes != 1) {
					this.inputs.num_nodes.value = 1;
					showAlert("Nodes per Job for standard partition must be 1.");
				} else if (this.values.MB_per_core > 9600){
					this.inputs.MB_per_core.value = 9600;
					showAlert("Maximum Memory per CPU for standard partition exceeded.");
				} else {
					break;
				}
				isValidConfiguration = false;
				break;
			case "interactive":
				if (this.values.tasks_per_node > 24) {
					this.inputs.tasks_per_node.value = 24;
					showAlert("Maximum Cores (GPU) per User for interactive partition exceeded.");
				} else if (this.values.num_nodes > 2) {
					this.inputs.num_nodes.value = 2;
					showAlert("Maximum Nodes per Job for interactive partition is 2.");
				} else if (this.values.MB_per_core > 9000){
					this.inputs.MB_per_core.value = 9000;
					showAlert("Maximum Memory per CPU for interactive partition exceeded.");
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
				} else if (this.values.MB_per_core > 8000){
					this.inputs.MB_per_core.value = 8000;
					showAlert("Maximum Memory per CPU for parallel partition exceeded.");
				} else {
					break;
				}
				isValidConfiguration = false;
				break;
			case "gpu":
				// Check for gpu partition constraints
				if (this.values.gpus > 32) {
					this.inputs.num_gpus.value = 32;
					showAlert("Maximum gres per gpu for gpu partition exceeded.");
				} else if (this.values.num_nodes > 4) {
					this.inputs.num_nodes.value = 4;
					showAlert("Maximum Nodes per Job for gpu partition is 4.");
				} else if (this.values.MB_per_core > 32000){
					this.inputs.MB_per_core.value = 32000
					showAlert("Maximum Memory per CPU for gpu partition exceeded.");
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

UVAScriptGen.prototype.generateScriptSLURM = function () {
	var scr = "#!/bin/bash\n\n#Submit this script with: sbatch thefilename\n\n";
	var sbatch = function sbatch(txt) {
		scr += "#SBATCH " + txt + "\n";
	};
	
	sbatch("--time=" + this.inputs.wallhours.value + ":" + this.inputs.wallmins.value + ":" + this.inputs.wallsecs.value + "   # walltime");

	// Add SLURM directives for number of nodes and tasks per node
	sbatch("--nodes="+this.inputs.num_nodes.value+"   # number of nodes");
	sbatch("--ntasks-per-node="+this.inputs.tasks_per_node.value+"   # number of processor cores (i.e. tasks)");
	sbatch("--cpus-per-task="+this.inputs.cpus_per_task.value+"   # number of CPU cores per task");

	if(this.inputs.num_gpus.value > 0) {
		if(this.values.gres.length > 0) {
			var gres = this.values.gres.join(",")
			sbatch("--gres=gpu:" + gres + ":" + this.inputs.num_gpus.value)
		}else{
			sbatch("--gres=gpu:" + this.inputs.num_gpus.value);
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
	if(this.inputs.group_name.value != '') {
		sbatch("--account=" + this.inputs.group_name.value);
	}

	scr += "\n\n# LOAD MODULES, INSERT CODE, AND RUN YOUR PROGRAMS HERE\n";
	return scr;
};

UVAScriptGen.prototype.updateJobscript = function() {
	var isValidConfiguration = this.retrieveValues();
    
	if (!isValidConfiguration) {
			return;
	}
	updateVisibility();
	this.updateSU();
	this.toJobScript();
};

UVAScriptGen.prototype.updateSU = function() {
	console.log(this.values)
	var suAfton = calculateSU(this.values)[0];
	var suRivanna = calculateSU(this.values)[1];

	var suAftonDiv = document.getElementById("uva_sg_su_afton");
	if(suAftonDiv) {
			suAftonDiv.textContent = "Service Units (Afton): " + suAfton;
	} else {
			suAftonDiv = document.createElement("div");
			suAftonDiv.id = "uva_sg_su_afton";
			suAftonDiv.textContent = "Service Units (Afton): " + suAfton;
			this.containerDiv.appendChild(suAftonDiv);
	}

	var suRivannaDiv = document.getElementById("uva_sg_su_rivanna");
	if(suRivannaDiv) {
			suRivannaDiv.textContent = "Service Units (Rivanna): " + suRivanna;
	} else {
			suRivannaDiv = document.createElement("div");
			suRivannaDiv.id = "uva_sg_su_rivanna";
			suRivannaDiv.textContent = "Service Units (Rivanna): " + suRivanna;
			this.containerDiv.appendChild(suRivannaDiv);
	}
}

function calculateSU(values) {
	var nnode = values.num_nodes;
	var ntask = values.tasks_per_node;
	var ncpu = values.cpus_per_task;
	var tmem = values.MB_per_core / 1024;
	var nhour = values.walltime_in_minutes / 60 / 60;
	console.log(nnode, ntask, ncpu, tmem, nhour);
	var ncore = nnode * ntask * ncpu;

	// Rates for Rivanna
	var R_c_Rivanna = 1;
	var R_m_Rivanna = 0.5;

	// Rates for Afton
	var R_c_Afton = 6;
	var R_m_Afton = 1;

	// Calculate SU for Rivanna
	var su_R = nhour * (ncore * R_c_Rivanna + tmem * R_m_Rivanna);

	// Calculate SU for Afton
	var su_A = nhour * (ncore * R_c_Afton + tmem * R_m_Afton);

	return [ su_A, su_R ];
}

UVAScriptGen.prototype.init = function() {
	this.inputDiv = document.createElement("div");
	this.inputDiv.id = "uva_sg_input_container";
	this.containerDiv.appendChild(this.inputDiv);

	var scriptHeader = document.createElement("h1");
	scriptHeader.id = "uva_sg_script_header";
	scriptHeader.appendChild(document.createTextNode("Job Script"));
	this.containerDiv.appendChild(scriptHeader);

	this.form = this.createForm();
	this.inputDiv.appendChild(this.form);

	this.jobScriptDiv = document.createElement("div");
	this.jobScriptDiv.id = "uva_sg_jobscript";
	this.jobScriptDiv.style.position = "relative";
	this.containerDiv.appendChild(this.jobScriptDiv);

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
	this.updateSU();
};

UVAScriptGen.prototype.toJobScript = function() {
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
};

