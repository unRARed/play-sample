class SamplesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_sample_pad
  before_action :set_sample, only: [:update, :destroy, :play, :edit]
  before_action :authorize_user!
  
  # GET /sample_pads/:sample_pad_id/samples
  def index
    @samples = @sample_pad.samples
    
    # For AJAX requests, just render the samples
    # For regular requests, redirect to the sample pad
    respond_to do |format|
      format.html { redirect_to sample_pad_path(@sample_pad) }
      format.json { render json: @samples }
      format.turbo_stream { render turbo_stream: turbo_stream.replace("sample_pad_samples", partial: "samples/samples", locals: { samples: @samples, pad: @sample_pad }) }
    end
  end
  
  # GET /sample_pads/:sample_pad_id/samples/new
  def new
    @sample = @sample_pad.samples.new
    @sample.position = params[:position]
    
    # Render in the turbo frame
    render :new
  end
  
  # GET /sample_pads/:sample_pad_id/samples/:id/edit
  def edit
    # Set sample is already called in the before_action
    render :edit
  end
  
  # POST /sample_pads/:sample_pad_id/samples
  def create
    @sample = @sample_pad.samples.new(sample_params)
    
    respond_to do |format|
      if @sample.save
        # Render the created sample pad in the turbo frame
        format.html { redirect_to sample_pad_path(@sample_pad), notice: "Sample was successfully added." }
        format.turbo_stream do
          flash.now[:notice] = "Sample was successfully added."
          render turbo_stream: turbo_stream.replace("sample_pad_#{@sample.position}", 
                                                  partial: "samples/pad", 
                                                  locals: { sample: @sample, pad: @sample_pad })
        end
      else
        format.html { render :new, status: :unprocessable_entity }
        format.turbo_stream do
          flash.now[:alert] = @sample.errors.full_messages.join(", ")
          render :new, status: :unprocessable_entity
        end
      end
    end
  end

  def update
    respond_to do |format|
      if @sample.update(sample_params)
        format.html { redirect_to sample_pad_path(@sample_pad), notice: "Sample was successfully updated." }
        format.turbo_stream { flash.now[:notice] = "Sample was successfully updated." }
      else
        format.html { redirect_to sample_pad_path(@sample_pad), status: :unprocessable_entity, alert: @sample.errors.full_messages.join(", ") }
        format.turbo_stream { flash.now[:alert] = @sample.errors.full_messages.join(", ") }
      end
    end
  end

  def destroy
    @sample.destroy
    
    respond_to do |format|
      format.html { redirect_to sample_pad_path(@sample_pad), notice: "Sample was successfully removed." }
      format.turbo_stream { flash.now[:notice] = "Sample was successfully removed." }
    end
  end
  
  def play
    # Simplified play action without ActionCable/Turbo StreamsChannel
    # Just return the sample audio URL for JavaScript to play
    
    respond_to do |format|
      format.html { redirect_to sample_pad_path(@sample_pad) }
      format.json { render json: { 
        id: @sample.id, 
        name: @sample.name, 
        label: @sample.label, 
        color: @sample.color, 
        play_mode: @sample.play_mode, 
        audio_url: rails_blob_path(@sample.audio, disposition: "attachment") 
      }}
      format.turbo_stream { render turbo_stream: turbo_stream.update("player-bar", partial: "samples/player", locals: { sample: @sample }) }
    end
  end
  
  def stop_all
    # Broadcast to stop all samples
    Turbo::StreamsChannel.broadcast_replace_to("playback",
      target: "playing_samples",
      partial: "samples/stop_all"
    )
    
    # Clear the now playing area
    Turbo::StreamsChannel.broadcast_replace_to("playback",
      target: "now_playing",
      partial: "samples/not_playing"
    )
    
    respond_to do |format|
      format.html { redirect_to sample_pad_path(params[:sample_pad_id]) if params[:sample_pad_id].present? }
      format.turbo_stream
    end
  end
  
  private
  
  def set_sample_pad
    # Handle the case where sample_pad_id might be missing or invalid
    if params[:sample_pad_id].present?
      @sample_pad = SamplePad.find_by(id: params[:sample_pad_id])
      
      # If sample_pad_id was provided but not found, redirect with an error
      unless @sample_pad
        respond_to do |format|
          format.html { redirect_to root_path, alert: 'Sample pad not found.' }
          format.turbo_stream { flash.now[:alert] = 'Sample pad not found.' }
          format.json { render json: { error: 'Sample pad not found' }, status: :not_found }
        end
      end
    elsif params[:id].present? && action_name == 'stop_all'
      # For the stop_all action, we might receive the sample_pad.id as :id parameter
      @sample_pad = SamplePad.find_by(id: params[:id])
    else
      # Handle the case where no sample_pad_id is provided
      respond_to do |format|
        format.html { redirect_to root_path, alert: 'Sample pad ID is required.' }
        format.turbo_stream { flash.now[:alert] = 'Sample pad ID is required.' }
        format.json { render json: { error: 'Sample pad ID is required' }, status: :bad_request }
      end
    end
  end
  
  def set_sample
    @sample = Sample.find(params[:id])
  end
  
  def authorize_user!
    unless @sample_pad.user == current_user
      respond_to do |format|
        format.html { redirect_to root_path, alert: "You are not authorized to modify samples in this pad." }
        format.turbo_stream { flash.now[:alert] = "You are not authorized to modify samples in this pad." }
      end
    end
  end
  
  def sample_params
    params.require(:sample).permit(:name, :label, :color, :play_mode, :audio, :position)
  end
end
